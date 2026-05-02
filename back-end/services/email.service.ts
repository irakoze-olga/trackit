import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

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

export function isEmailConfigured() {
  return Boolean(transporter);
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (!transporter) return false;

  await transporter.sendMail({
    from: `TrackIt <${env.EMAIL}>`,
    to,
    subject,
    html,
  });

  return true;
}

export function renderSimpleMessageEmail(title: string, name: string, message: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2>${title}</h2>
      <p>Hi ${name},</p>
      <p>${message}</p>
      <p><a href="${env.SYSTEM_LOGIN_URL}" style="background:#111827;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Open TrackIt</a></p>
    </div>
  `;
}

