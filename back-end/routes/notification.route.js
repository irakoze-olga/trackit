import { Router } from "express";
import {
  createNotification,
  deleteNotification,
  getNotificationPreferences,
  getNotifications,
  markNotificationAsRead,
  updateNotificationPreferences,
} from "../controller/notification.controller.js";

const notificationRouter = Router();

notificationRouter.get("/", getNotifications);
notificationRouter.post("/", createNotification);
notificationRouter.patch("/:id/read", markNotificationAsRead);
notificationRouter.delete("/:id", deleteNotification);
notificationRouter.get("/preferences", getNotificationPreferences);
notificationRouter.put("/preferences", updateNotificationPreferences);

export default notificationRouter;
