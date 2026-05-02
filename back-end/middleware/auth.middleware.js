import jwt from "jsonwebtoken";
<<<<<<< HEAD
=======
import mongoose from "mongoose";
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
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
<<<<<<< HEAD
=======
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
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

<<<<<<< HEAD
    req.user = jwt.verify(token, env.JWT_SECRET);
=======
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      req.user = null;
      return next();
    }
    req.user = decoded;
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
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
<<<<<<< HEAD
=======
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183

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
<<<<<<< HEAD
=======
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
