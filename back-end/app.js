import express from 'express';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import connectToDatabase from './config/database.js';
import authRouter from './routes/auth.route.js';
import eventRouter from './routes/event.route.js';
import userRouter from './routes/user.routes.js';
import applicationRouter from './routes/application.route.js';
import savedRouter from './routes/saved.route.js';
import notificationRouter from './routes/notification.route.js';
import analyticsRouter from './routes/analytics.route.js';
import errorMiddleware from './middleware/error.middleware.js';
import { authorizeUser } from './middleware/auth.middleware.js';
import { env } from './config/env.js';
import './controller/event.cleanup.js';
import "./controller/email.controller.js";

config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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
  res.send("TrackIt....");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/event", eventRouter);
app.use("/api/v1/user", authorizeUser, userRouter);
app.use("/api/v1/application", authorizeUser, applicationRouter);
app.use("/api/v1/saved", authorizeUser, savedRouter);
app.use("/api/v1/notifications", authorizeUser, notificationRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use(errorMiddleware);

app.listen(env.PORT || 3000, () => {
  console.log(`do not look  at me${env.PORT} broooo...`);
});


