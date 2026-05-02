import cron from "node-cron";
import nodemailer from "nodemailer";
import Application from "../models/application.model.js";
import { env } from "../config/env.js";

const canSendEmail = Boolean(env.EMAIL && env.EMAIL_PASSWORD);

const transporter = canSendEmail
  ? nodemailer.createTransport({
    host: env.EMAIL_SERVICE,
    port: env.EMAIL_PORT ? Number(env.EMAIL_PORT) : undefined,
    secure: env.EMAIL_SECURE,
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
  if (!transporter) {
    return;
  }

  await transporter.sendMail({
    from: `TrackIt <${env.EMAIL}>`,
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

export const sendOTPEmail = async (to, otp, purpose = 'verification') => {
  if (!transporter) {
    console.log('Email transporter not configured, skipping OTP email');
    return;
  }

  const purposeText = purpose === 'login' ? 'Login' : 'Email Verification';
  const purposeDescription = purpose === 'login'
    ? 'to sign in to your TrackIt account'
    : 'to verify your email address';

  const mailOptions = {
    from: `TrackIt <${env.EMAIL}>`,
    to,
    subject: `${purposeText} OTP - TrackIt`,
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
                <h1 style="color:#ffffff; margin:0; font-size:22px;">TrackIt ${purposeText}</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#111827;">
                <h2 style="margin-top:0;">Your Verification Code</h2>
                
                <p style="color:#4b5563; line-height:1.6;">
                  Use the code below ${purposeDescription}. This code will expire in <strong>10 minutes</strong>.
                </p>

                <!-- OTP Display -->
                <div style="background:#f3f4f6; border:2px dashed #d1d5db; border-radius:8px; 
                           padding:20px; margin:30px 0; text-align:center;">
                  <span style="font-size:32px; font-weight:bold; letter-spacing:8px; 
                               color:#111827; font-family:monospace;">${otp}</span>
                </div>

                <p style="color:#6b7280; font-size:14px; text-align:center;">
                  If you didn't request this code, please ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#6b7280;">
                © ${new Date().getFullYear()} TrackIt. All rights reserved.<br>
                This is an automated message, please do not reply.
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
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to} for ${purpose}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${to}:`, error);
    throw error;
  }
};

export const sendWelcomeEmail = async (to, name) => {
  if (!transporter) {
    return;
  }

  const mailOptions = {
    from: `TrackIt <${env.EMAIL}>`,
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

// Enhanced notification emails
export const sendOpportunityNotificationEmail = async (to, userName, opportunity, notificationType) => {
  if (!transporter) return;

  const typeConfig = {
    'new_opportunity': {
      subject: `New ${opportunity.category}: ${opportunity.title}`,
      title: 'New Opportunity Available!',
      description: `A new ${opportunity.category} opportunity has been posted that might interest you.`
    },
    'deadline_reminder': {
      subject: `Deadline Reminder: ${opportunity.title}`,
      title: 'Deadline Approaching!',
      description: `The deadline for this opportunity is approaching. Don't miss out!`
    },
    'application_update': {
      subject: `Application Update: ${opportunity.title}`,
      title: 'Application Status Update',
      description: 'There has been an update to your application status.'
    }
  };

  const config = typeConfig[notificationType] || typeConfig['new_opportunity'];

  const mailOptions = {
    from: `TrackIt <${env.EMAIL}>`,
    to,
    subject: config.subject,
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
                <h1 style="color:#ffffff; margin:0; font-size:22px;">${config.title}</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#111827;">
                <h2 style="margin-top:0;">Hi ${userName},</h2>
                
                <p style="color:#4b5563; line-height:1.6;">
                  ${config.description}
                </p>

                <!-- Opportunity Card -->
                <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; 
                           padding:20px; margin:20px 0;">
                  <h3 style="margin-top:0; color:#111827;">${opportunity.title}</h3>
                  <p style="color:#6b7280; margin:8px 0;">
                    <strong>Provider:</strong> ${opportunity.provider}<br>
                    <strong>Category:</strong> ${opportunity.category}<br>
                    <strong>Deadline:</strong> ${new Date(opportunity.deadline).toLocaleDateString()}
                  </p>
                  <p style="color:#4b5563; line-height:1.5; margin:10px 0;">
                    ${opportunity.description?.substring(0, 150)}...
                  </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align:center; margin:30px 0;">
                  <a href="${env.CLIENT_URL}/opportunities/${opportunity._id}" 
                    style="background:#111827; color:#ffffff; padding:12px 24px; 
                    text-decoration:none; border-radius:6px; display:inline-block; font-weight:bold;">
                    View Opportunity
                  </a>
                </div>

                <p style="color:#6b7280; font-size:14px;">
                  You're receiving this email because you're subscribed to TrackIt notifications.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#6b7280;">
                © ${new Date().getFullYear()} TrackIt. All rights reserved.<br>
                <a href="${env.CLIENT_URL}/settings/notifications" style="color:#6b7280;">Unsubscribe</a>
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
    await transporter.sendMail(mailOptions);
    console.log(`${notificationType} email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending ${notificationType} email:`, error);
  }
};
