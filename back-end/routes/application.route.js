import { Router } from "express";
import {
  createApplication,
  deleteApplicationById,
  getAllApplications,
  getApplicationById,
  getApplicationSummary,
  updateApplicationById,
} from "../controller/application.controller.js";
import { validate } from "../middleware/validate.middleware.ts";
import { createApplicationSchema, updateApplicationSchema } from "../validations/application.validation.ts";

const applicationRouter = Router();

applicationRouter.get("/summary", getApplicationSummary);
applicationRouter.get("/applications", getAllApplications);
applicationRouter.post("/applications", validate(createApplicationSchema), createApplication);
applicationRouter.get("/applications/:id", getApplicationById);
applicationRouter.patch("/applications/:id", validate(updateApplicationSchema), updateApplicationById);
applicationRouter.delete("/applications/:id", deleteApplicationById);

export default applicationRouter;
