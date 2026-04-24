import cron from "node-cron";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Application from "../models/application.model.js";
import { env } from "../config/env.js";

dotenv.config();

const canSendEmail = Boolean(env.EMAIL && env.EMAIL_PASSWORD);

const transporter = canSendEmail
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASSWORD,
      },
    })
  : null;

cron.schedule(
  "0 8 * * *",
  async () => {
    if (!transporter) {
      console.log("Skipping reminder emails because email credentials are not configured");
      return;
    }

    console.log("Checking deadlines...");

    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const applications = await Application.find({
      deadline: {
        $gte: tomorrowStart,
        $lte: tomorrowEnd,
      },
      reminderSent: false,
      status: { $in: ["saved", "interested", "in_progress"] },
    })
      .populate("applicant", "firstname lastname email")
      .populate("event", "title");

    if (!applications.length) {
      console.log("No application deadlines are approaching");
      return;
    }

    for (const application of applications) {
      await sendReminder(application);
      application.reminderSent = true;
      application.lastReminderAt = new Date();
      await application.save();
    }
  },
  { timezone: "Africa/Kigali" }
);

const sendReminder = async (application) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: application.applicant.email,
    subject: `Reminder: ${application.event.title} deadline is tomorrow`,
    html: `
      <h2>Deadline Reminder</h2>
      <p>Hi ${application.applicant.firstname},</p>
      <p>Your application for <strong>${application.event.title}</strong>
      is due tomorrow on <strong>${application.deadline.toDateString()}</strong>.</p>
      <p>Keep going, you are almost there.</p>
    `,
  });

  console.log(`Reminder sent to ${application.applicant.email}`);
};
