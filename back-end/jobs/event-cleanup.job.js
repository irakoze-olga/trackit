import cron from "node-cron";
import Event from "../models/event.model.js";
import Application from "../models/application.model.js";

const cleanupExpiredEvents = async () => {
  const now = new Date();

  const expiredEvents = await Event.find({
    deadline: { $lt: now },
  });

  if (!expiredEvents.length) {
    return;
  }

  const expiredEventIds = expiredEvents.map((event) => event._id);

  await Application.updateMany(
    {
      event: { $in: expiredEventIds },
      status: { $in: ["saved", "interested", "in_progress"] },
    },
    {
      $set: { status: "withdrawn", lastActivityAt: new Date() },
    }
  );

  await Event.deleteMany({
    _id: { $in: expiredEventIds },
  });
};

cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      await cleanupExpiredEvents();
    } catch (error) {
      console.error("Cleanup job failed:", error);
    }
  },
  { timezone: "Africa/Kigali" }
);

export default cleanupExpiredEvents;

