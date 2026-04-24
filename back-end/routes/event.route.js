import { Router } from "express";
import {
  createEvent,
  deleteEventById,
  getCalendarSummary,
  getEventById,
  getEvents,
  getEventsByAge,
  incrementEventViews,
  updateEventById,
} from "../controller/event.controller.js";
import {
  authorizeRoles,
  authorizeUser,
  optionalAuth,
} from "../middleware/auth.middleware.js";

const eventRouter = Router();

eventRouter.get("/summary", authorizeUser, getCalendarSummary);
eventRouter.get("/events", optionalAuth, getEvents);
eventRouter.get("/events/age/:age", getEventsByAge);
eventRouter.get("/events/:id", getEventById);
eventRouter.post("/events/:id/view", incrementEventViews);
eventRouter.post("/events", authorizeUser, authorizeRoles("teacher", "admin"), createEvent);
eventRouter.patch("/events/:id", authorizeUser, authorizeRoles("teacher", "admin"), updateEventById);
eventRouter.delete("/events/:id", authorizeUser, authorizeRoles("teacher", "admin"), deleteEventById);

export default eventRouter;
