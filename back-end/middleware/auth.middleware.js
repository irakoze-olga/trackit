import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/env.js";

const getToken = (req) => {
  const authHeader = req.headers.authorization;

  if (req.cookies?.token) {
    return req.cookies.token;
  }

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

export const authorizeUser = (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      req.user = null;
      return next();
    }
    req.user = decoded;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export const authorizeAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      const token = getToken(req);

      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = jwt.verify(token, env.JWT_SECRET);
    }
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  try {
    if (!req.user) {
      const token = getToken(req);

      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = jwt.verify(token, env.JWT_SECRET);
    }
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
