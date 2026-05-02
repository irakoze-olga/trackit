import express from 'express';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'node:url';
import connectToDatabase from './config/database.js';
import authRouter from './routes/auth.route.js';
import opportunityRouter from "./routes/opportunity.route.js";
import userRouter from './routes/user.routes.js';
import applicationRouter from './routes/application.route.js';
import savedRouter from './routes/saved.route.js';
import notificationRouter from './routes/notification.route.js';
import analyticsRouter from './routes/analytics.route.js';
import publicRouter from './routes/public.route.js';
import errorMiddleware from './middleware/error.middleware.js';
import { authorizeUser } from './middleware/auth.middleware.js';
import { env } from './config/env.js';
import "./jobs/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/resources", express.static(fileURLToPath(new URL("../resources", import.meta.url))));
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const isDevelopment = env.NODE_ENV !== "production";

  if (requestOrigin && (isDevelopment || requestOrigin === env.CLIENT_URL)) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Vary", "Origin");
  } else {
    res.header("Access-Control-Allow-Origin", env.CLIENT_URL);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

connectToDatabase();

app.get("/", (req, res) => {
  res.json({ name: "TrackIt API", status: "ok" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", environment: env.NODE_ENV });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/public", publicRouter);
app.use("/api/v1/opportunities", opportunityRouter);
app.use("/api/v1/users", authorizeUser, userRouter);
app.use("/api/v1/opportunities", authorizeUser, applicationRouter);
app.use("/api/v1/users/saved", authorizeUser, savedRouter);
app.use("/api/v1/users/notifications", authorizeUser, notificationRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`TrackIt API listening on port ${env.PORT}`);
});
