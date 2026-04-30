import { env } from "../config/env.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/async-handler.js";
import { login as loginService, registerTeacherWithInvite as registerTeacherWithInviteService } from "../services/auth.service.ts";

export const registerTeacherWithInvite = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password, institution, bio, avatarUrl, inviteToken } =
    req.body || {};

  const user = await registerTeacherWithInviteService({
    firstname,
    lastname,
    email,
    password,
    institution,
    bio,
    avatarUrl,
    inviteToken,
  });

  res.status(201).json({
    message: "account created successfully",
    user: {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      institution: user.institution,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  const { token, user } = await loginService(req, { email, password });
  const isProduction = env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "You are in!",
    token,
    user: {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      age: user.age,
      fullName: user.fullName,
      institution: user.institution,
      fieldOfStudy: user.fieldOfStudy,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      mustChangePassword: user.mustChangePassword,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user.id, isActive: true }).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    message: "Current user retrieved successfully",
    user: {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      age: user.age,
      institution: user.institution,
      fieldOfStudy: user.fieldOfStudy,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});
