import { Router } from "express";
import {
  createEvent,
  deleteEventById,
  approveEventById,
  getCalendarSummary,
  getEventById,
  getEvents,
  getEventsByAge,
  incrementEventViews,
  rejectEventById,
  updateEventById,
  upsertEventEngagement,
} from "../controller/event.controller.js";
import {
  authorizeRoles,
  authorizeUser,
  optionalAuth,
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.ts";
import {
  approveRejectParamsSchema,
  createEventSchema,
  engagementSchema,
  updateEventSchema,
} from "../validations/event.validation.ts";

const opportunityRouter = Router();

opportunityRouter.get("/summary", authorizeUser, getCalendarSummary);
opportunityRouter.get("/", optionalAuth, getEvents);
opportunityRouter.get("/age/:age", getEventsByAge);
opportunityRouter.get("/:id", getEventById);
opportunityRouter.post("/:id/view", incrementEventViews);
opportunityRouter.post(
  "/",
  authorizeUser,
  authorizeRoles("student", "teacher", "maintainer", "admin"),
  validate(createEventSchema),
  createEvent
);
opportunityRouter.patch(
  "/:id",
  authorizeUser,
  authorizeRoles("student", "teacher", "maintainer", "admin"),
  validate(updateEventSchema),
  updateEventById
);
opportunityRouter.patch(
  "/:id/approve",
  authorizeUser,
  authorizeRoles("admin"),
  validate(approveRejectParamsSchema),
  approveEventById
);
opportunityRouter.patch(
  "/:id/reject",
  authorizeUser,
  authorizeRoles("admin"),
  validate(approveRejectParamsSchema),
  rejectEventById
);
opportunityRouter.put(
  "/:id/engagement",
  authorizeUser,
  authorizeRoles("student"),
  validate(engagementSchema),
  upsertEventEngagement
);
opportunityRouter.delete(
  "/:id",
  authorizeUser,
  authorizeRoles("student", "teacher", "maintainer", "admin"),
  deleteEventById
);

export default opportunityRouter;

