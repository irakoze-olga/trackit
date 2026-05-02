<<<<<<< HEAD
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sendWelcomeEmail } from "./email.controller.js";

export const signup = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      role,
      age,
      institution,
      fieldOfStudy,
      bio,
      avatarUrl,
    } = req.body;

    if (!firstname || !lastname || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (role === "student" && !age) {
      return res.status(400).json({ message: "Age is required for students" });
    }
    if (role === "admin") {
      return res.status(400).json({ message: "restricted zone" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
      age,
      institution,
      fieldOfStudy,
      bio,
      avatarUrl,
    });
    try {
      await sendWelcomeEmail(email, firstname);
    } catch (error) {
      console.error("Welcome email failed", error);
    }
    res.status(201).json({
      message: "account created successfully",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        age: user.age,
        institution: user.institution,
        fieldOfStudy: user.fieldOfStudy,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message:"All the fields are required!" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(404).json({ message: "Account doesn't exist!" });
    }

    const comparePassword = await bcrypt.compare(password, existingUser.password);
    if (!comparePassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: existingUser._id.toString(), role: existingUser.role, email: existingUser.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    if(!token) return res.status(500).json({msg:"something went wrong"})

    const isProduction = env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "You are in!",
      token,
      user: {
        id: existingUser._id,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        email: existingUser.email,
        role: existingUser.role,
        age: existingUser.age,
        fullName: existingUser.fullName,
        institution: existingUser.institution,
        fieldOfStudy: existingUser.fieldOfStudy,
        bio: existingUser.bio,
        avatarUrl: existingUser.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

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
  } catch (error) {
    next(error);
  }
};
=======
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
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
