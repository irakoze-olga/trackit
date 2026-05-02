import { Router } from "express";
import {
  createApplication,
  deleteApplicationById,
  getAllApplications,
  getApplicationById,
  getApplicationSummary,
  updateApplicationById,
} from "../controller/application.controller.js";

const applicationRouter = Router();

applicationRouter.get("/summary", getApplicationSummary);
applicationRouter.get("/applications", getAllApplications);
applicationRouter.post("/applications", createApplication);
applicationRouter.get("/applications/:id", getApplicationById);
applicationRouter.patch("/applications/:id", updateApplicationById);
applicationRouter.delete("/applications/:id", deleteApplicationById);

export default applicationRouter;
