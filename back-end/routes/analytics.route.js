import { Router } from "express";
import {
  getPublicMetrics,
  getStudentAnalytics,
  getTeacherAnalytics,
} from "../controller/analytics.controller.js";
import { authorizeRoles } from "../middleware/auth.middleware.js";

const analyticsRouter = Router();

analyticsRouter.get("/public", getPublicMetrics);
analyticsRouter.get("/student", authorizeRoles("student"), getStudentAnalytics);
analyticsRouter.get("/teacher", authorizeRoles("teacher", "admin"), getTeacherAnalytics);

export default analyticsRouter;
