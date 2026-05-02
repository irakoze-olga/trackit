import bcrypt from "bcrypt";
import crypto from "node:crypto";
import User from "../models/user.model.js";
import { env } from "../config/env.js";
import { notifyUser } from "./notification.service.ts";

const generatePassword = () => crypto.randomBytes(18).toString("base64url");

export async function sendUserInvitationByAdmin(userId: string) {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const temporaryPassword = generatePassword();
  user.password = await bcrypt.hash(temporaryPassword, 10);
  user.mustChangePassword = true;
  await user.save();

  await notifyUser(user, {
    type: "security_alert",
    title: "Your TrackIt account is ready",
    message: `Your account has been created by an administrator.\n\nTemporary password: ${temporaryPassword}\nSign in: ${env.SYSTEM_LOGIN_URL}\n\nPlease change your password after login.`,
  });

  return true;
}

