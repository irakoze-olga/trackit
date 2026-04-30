import Notification, { NotificationPreference } from "../models/notification.model.js";
import type User from "../models/user.model.js";
import { isEmailConfigured, renderSimpleMessageEmail, sendEmail } from "./email.service.ts";
import { sendSlackDM } from "./slack.service.ts";

export type NotifyPayload = {
  type:
    | "deadline_reminder"
    | "status_update"
    | "application_received"
    | "opportunity_verified"
    | "opportunity_posted"
    | "security_alert";
  title: string;
  message: string;
  eventId?: string;
};

function preferenceAllows(preferences: any, payloadType: NotifyPayload["type"]) {
  if (payloadType === "security_alert") return true;
  if (payloadType === "deadline_reminder") return preferences?.deadlineReminders !== false;
  if (payloadType === "status_update" || payloadType === "application_received") {
    return preferences?.statusUpdates !== false;
  }
  if (payloadType === "opportunity_posted" || payloadType === "opportunity_verified") {
    // Keep behavior consistent: users expect to hear about approved opportunities.
    return preferences?.statusUpdates !== false;
  }
  return true;
}

export async function sendEmailToUser(user: any, subject: string, message: string) {
  if (!isEmailConfigured()) return false;
  return sendEmail({
    to: user.email,
    subject,
    html: renderSimpleMessageEmail(subject, user.firstname || user.fullName || "there", message),
  });
}

export async function sendSlackDMToUser(user: any, message: string) {
  return sendSlackDM(user.slackUserId, message);
}

export async function notifyUser(user: any, payload: NotifyPayload) {
  const preference =
    (await NotificationPreference.findOne({ user: user._id || user.id })) ||
    (await NotificationPreference.create({ user: user._id || user.id }));

  const notification = await Notification.create({
    user: user._id || user.id,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    event: payload.eventId,
  });

  if (!preferenceAllows(preference, payload.type)) {
    return { notification, dispatched: { email: false, slack: false } };
  }

  const [emailSent, slackSent] = await Promise.all([
    sendEmailToUser(user, payload.title, payload.message).catch((error) => {
      console.error("Email notify failed", error);
      return false;
    }),
    sendSlackDMToUser(user, payload.message).catch((error) => {
      console.error("Slack notify failed", error);
      return false;
    }),
  ]);

  return { notification, dispatched: { email: emailSent, slack: slackSent } };
}

