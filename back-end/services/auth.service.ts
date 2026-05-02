import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import TeacherInvite from "../models/teacherInvite.model.js";
import Session from "../models/session.model.ts";
import { env } from "../config/env.js";
import { notifyUser } from "./notification.service.ts";

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

function getSessionFingerprint(req: any) {
  return {
    ip: String(req.ip || ""),
    userAgent: String(req.headers["user-agent"] || "unknown"),
  };
}

export default async function registerTeacherWithInvite(input: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  institution?: string;
  bio?: string;
  avatarUrl?: string;
  inviteToken: string;
}) {
  const invite = await TeacherInvite.findOne({
    tokenHash: hashToken(input.inviteToken),
    usedAt: null,
    expiresAt: { $gte: new Date() },
  });

  if (!invite) {
    const error: any = new Error("Teacher invite link is invalid or expired");
    error.statusCode = 403;
    throw error;
  }

  if (invite.email && invite.email !== input.email.toLowerCase()) {
    const error: any = new Error("This invite is for another email address");
    error.statusCode = 403;
    throw error;
  }

  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    const error: any = new Error("Email taken");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    firstname: input.firstname,
    lastname: input.lastname,
    email: input.email,
    password: hashedPassword,
    role: "teacher",
    institution: input.institution || "Rwanda Coding Academy",
    bio: input.bio,
    avatarUrl: input.avatarUrl,
  });

  invite.usedAt = new Date();
  invite.usedBy = user._id;
  await invite.save();

  await notifyUser(user, {
    type: "status_update",
    title: "Welcome to TrackIt",
    message: "Your teacher account is ready. You can now sign in and start sharing opportunities.",
  }).catch((error) => console.error("Welcome notification failed", error));

  return user;
}

export async function login(req: any, input: { email: string; password: string }) {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() }).select(
    "+lastLoginFingerprints"
  );
  if (!existingUser) {
    const error: any = new Error("Account doesn't exist!");
    error.statusCode = 404;
    throw error;
  }
  if (!existingUser.isActive) {
    const error: any = new Error(
      "This account has been deactivated. Contact the RCA TrackIt administrator."
    );
    error.statusCode = 403;
    throw error;
  }

  const comparePassword = await bcrypt.compare(input.password, existingUser.password);
  if (!comparePassword) {
    const error: any = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: existingUser._id.toString(), role: existingUser.role, email: existingUser.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const { ip, userAgent } = getSessionFingerprint(req);
  const existingSession = await Session.findOne({
    userId: existingUser._id,
    ip,
    userAgent,
  });

  if (!existingSession) {
    const priorSessions = await Session.countDocuments({ userId: existingUser._id });
    await Session.create({
      userId: existingUser._id,
      ip,
      userAgent,
      lastActive: new Date(),
    });

    if (priorSessions > 0) {
      await notifyUser(existingUser, {
        type: "security_alert",
        title: "Security notice: new device login",
        message: `Your account was accessed from a new device.\n\nDevice: ${userAgent || "Unknown"}`,
      }).catch((error) => console.error("Security login notification failed", error));
    }
  } else {
    existingSession.lastActive = new Date();
    await existingSession.save();
  }

  return { token, user: existingUser };
}

