import User from "../models/user.model.js";
import TeacherInvite from "../models/teacherInvite.model.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import asyncHandler from "../utils/async-handler.js";
import { sendUserInvitationByAdmin } from "../services/user.service.ts";

const publicUserFields =
  "-password -lastLoginFingerprints";

const generatePassword = () =>
  crypto.randomBytes(18).toString("base64url");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const mapPublicUser = (user) => ({
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
  slackUserId: user.slackUserId,
  githubUsername: user.githubUsername,
  linkedinUrl: user.linkedinUrl,
  isActive: user.isActive,
  mustChangePassword: user.mustChangePassword,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getUsers = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.role) {
      filters.role = req.query.role;
    } else {
      filters.role = { $ne: "admin" };
    }

    if (req.query.active === "true") filters.isActive = true;
    if (req.query.active === "false") filters.isActive = false;

    const users = await User.find(filters).select(publicUserFields).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Users retrieved successfully",
      total: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(publicUserFields);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select(publicUserFields);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deactivated successfully",
      user: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(publicUserFields);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUserProfile = async (req, res, next) => {
  try {
    const updates = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      institution: req.body.institution,
      fieldOfStudy: req.body.fieldOfStudy,
      bio: req.body.bio,
      avatarUrl: req.body.avatarUrl,
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select(publicUserFields);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUserByAdmin = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      email,
      role,
      age,
      institution,
      fieldOfStudy,
      bio,
      avatarUrl,
      slackUserId,
      githubUsername,
      linkedinUrl,
    } = req.body || {};

    if (!firstname || !lastname || !email || !role) {
      return res.status(400).json({ message: "Firstname, lastname, email and role are required" });
    }

    if (!["student", "teacher", "maintainer"].includes(role)) {
      return res.status(400).json({ message: "Admin can create students, teachers and maintainers only" });
    }

    if (role === "student" && !age) {
      return res.status(400).json({ message: "Age is required for students" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email taken" });
    }

    const temporaryPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const user = await User.create({
      firstname,
      lastname,
      email,
      role,
      age,
      institution: institution || "Rwanda Coding Academy",
      fieldOfStudy,
      bio,
      avatarUrl,
      slackUserId,
      githubUsername,
      linkedinUrl,
      password: hashedPassword,
      mustChangePassword: true,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: mapPublicUser(user),
      temporaryPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const sendUserInvitation = async (req, res, next) => {
  try {
    await sendUserInvitationByAdmin(req.params.id);
    return res.status(200).json({ message: "Invitation sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const createTeacherInvite = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const invite = await TeacherInvite.create({
      tokenHash: hashToken(token),
      email: req.body?.email,
      createdBy: req.user.id,
      expiresAt,
    });

    return res.status(201).json({
      message: "Teacher registration link created",
      invite: {
        id: invite._id,
        email: invite.email,
        expiresAt: invite.expiresAt,
        registrationUrl: `${env.CLIENT_URL}/auth/teacher-invite/${token}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMaintainers = async (_req, res, next) => {
  try {
    const maintainers = await User.find({ role: "maintainer", isActive: true })
      .select(publicUserFields)
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Maintainers retrieved successfully",
      maintainers: maintainers.map(mapPublicUser),
    });
  } catch (error) {
    next(error);
  }
};
