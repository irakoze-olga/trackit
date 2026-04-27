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
      return res.status(400).json({ message: "Unauthorized to create admin" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
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
    // let us send the welcome email
    try {
      sendWelcomeEmail(email, firstname)

    } catch (error) {
      return res.status(5000).json({ msg: "error occurred while sending the email" })
    }
    res.status(201).json({
      message: "User created successfully",
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
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const comparePassword = await bcrypt.compare(password, existingUser.password);
    if (!comparePassword) {
      return res.status(401).json({ message: "Invalid password" });
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
      message: "Login successful",
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
