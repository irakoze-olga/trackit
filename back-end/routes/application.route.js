import { Router } from "express";
import {
  createApplication,
  deleteApplicationById,
  getAllApplications,
  getApplicationById,
  getApplicationSummary,
  updateApplicationById,
} from "../controller/application.controller.js";
<<<<<<< HEAD
=======
import { validate } from "../middleware/validate.middleware.ts";
import { createApplicationSchema, updateApplicationSchema } from "../validations/application.validation.ts";
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183

const applicationRouter = Router();

applicationRouter.get("/summary", getApplicationSummary);
applicationRouter.get("/applications", getAllApplications);
<<<<<<< HEAD
applicationRouter.post("/applications", createApplication);
applicationRouter.get("/applications/:id", getApplicationById);
applicationRouter.patch("/applications/:id", updateApplicationById);
=======
applicationRouter.post("/applications", validate(createApplicationSchema), createApplication);
applicationRouter.get("/applications/:id", getApplicationById);
applicationRouter.patch("/applications/:id", validate(updateApplicationSchema), updateApplicationById);
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
applicationRouter.delete("/applications/:id", deleteApplicationById);

export default applicationRouter;
