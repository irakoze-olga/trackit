import cron from "node-cron";
import Event from "../models/event.model.js";
import Application from "../models/application.model.js";
import OpportunityEngagement from "../models/opportunityEngagement.model.js";
import { notifyUser } from "../services/notification.service.ts";

const pMapLimit = async (items, limit, mapper) => {
  const executing = new Set();
  const results = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => mapper(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
};

cron.schedule(
  "*/10 * * * *",
  async () => {
    try {
      const now = new Date();
      const next24h = new Date(now);
      next24h.setHours(next24h.getHours() + 24);

      const closingSoon = await Event.find({
        deadline: { $gte: now, $lte: next24h },
        status: "active",
        approvalStatus: "approved",
      }).select("_id title deadline link");

      if (!closingSoon.length) return;

      const eventIds = closingSoon.map((event) => event._id);
      const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);

      const [applications, engagements] = await Promise.all([
        Application.find({
          event: { $in: eventIds },
          status: { $in: ["submitted", "pending", "under_review", "in_progress"] },
          $or: [{ lastReminderAt: { $exists: false } }, { lastReminderAt: { $lt: cutoff } }],
        })
          .populate("applicant", "firstname lastname email slackUserId")
          .populate("event", "title deadline link"),
        OpportunityEngagement.find({
          event: { $in: eventIds },
          interested: true,
          $or: [{ lastReminderAt: { $exists: false } }, { lastReminderAt: { $lt: cutoff } }],
        })
          .populate("user", "firstname lastname email slackUserId")
          .populate("event", "title deadline link"),
      ]);

      await pMapLimit(applications, 10, async (application) => {
        const applicant = application.applicant;
        const event = application.event;
        if (!applicant || !event) return;

        const message = `Reminder: "${event.title}" closes within 24 hours (deadline: ${new Date(
          event.deadline
        ).toLocaleString()}).`;

        await notifyUser(applicant, {
          type: "deadline_reminder",
          title: `Deadline reminder: ${event.title}`,
          message,
          eventId: String(event._id),
        });

        application.lastReminderAt = new Date();
        application.reminderSent = true;
        await application.save();
      });

      await pMapLimit(engagements, 10, async (engagement) => {
        const user = engagement.user;
        const event = engagement.event;
        if (!user || !event) return;

        const message = `Reminder: "${event.title}" closes within 24 hours (deadline: ${new Date(
          event.deadline
        ).toLocaleString()}).`;

        await notifyUser(user, {
          type: "deadline_reminder",
          title: `Deadline reminder: ${event.title}`,
          message,
          eventId: String(event._id),
        });

        engagement.lastReminderAt = new Date();
        engagement.reminderSent = true;
        await engagement.save();
      });
    } catch (error) {
      console.error("Deadline reminder job failed:", error);
    }
  },
  { timezone: "Africa/Kigali" }
);

