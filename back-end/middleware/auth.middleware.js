import jwt from "jsonwebtoken";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
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

    req.user = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
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

      req.user = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
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

      req.user = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    next(error);
  }
};