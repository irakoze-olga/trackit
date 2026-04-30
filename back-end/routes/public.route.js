import { Router } from "express";
import { getMaintainers } from "../controller/user.controller.js";

const publicRouter = Router();

publicRouter.get("/maintainers", getMaintainers);

export default publicRouter;
