import { Router } from "express";
import {
  getSavedOpportunities,
  removeSavedOpportunity,
  saveOpportunity,
} from "../controller/saved.controller.js";

const savedRouter = Router();

savedRouter.get("/", getSavedOpportunities);
savedRouter.post("/", saveOpportunity);
savedRouter.delete("/:eventId", removeSavedOpportunity);

export default savedRouter;
