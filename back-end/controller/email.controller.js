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

export const sendReminder = async (application) => {
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

export const sendWelcomeEmail = async (to, name) => {

  const mailOptions = {
    from: `TrackIt<${env.EMAIL}>`,
    to,
    subject: "Welcome to TrackIt",
    html: `
  <div style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          
          <table width="600" cellpadding="0" cellspacing="0" 
            style="background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #e5e5e5;">
            
            <!-- Header -->
            <tr>
              <td style="background:#111827; padding:24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:22px;">Welcome to TrackIt</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#111827;">
                <h2 style="margin-top:0;">Hello 👋</h2>
                
                <p style="color:#4b5563; line-height:1.6;">
                We are glad to have you here, TrackIt helps you stay update with your applications <br>
                and our mission is to see your success
                </p>

                <p style="color:#4b5563; line-height:1.6;">
                  Your account is ready. You can now start using the platform and explore its features.
                </p>

                <!-- CTA Button -->
                <div style="text-align:center; margin:30px 0;">
                  <a href="${env.CLIENT_URL}" 
                    style="background:#111827; color:#ffffff; padding:12px 24px; 
                    text-decoration:none; border-radius:6px; display:inline-block; font-weight:bold;">
                    Get Started
                  </a>
                </div>

                <p style="color:#6b7280; font-size:14px;">
                  If you did not create this account, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#6b7280;">
                © ${new Date().getFullYear()} TrackIt. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `
  };
  try {
    await transporter.sendMail(mailOptions)

    console.log(`Welcome email sent to ${name}`)

  } catch (error) {
    console.error(`Error occurred while sending the email\n${error}`)
  }

}


