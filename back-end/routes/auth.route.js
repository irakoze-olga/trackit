import { Router } from "express";
import  registerTeacherWithInvite,{ login} from "../services/auth.service.ts";
import { me } from "../controller/auth.controller.js"

import { authorizeUser } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.ts";
import { loginSchema, teacherInviteRegistrationSchema } from "../validations/auth.validation.ts";

const authRouter=Router();

authRouter.post("/teacher-invite", validate(teacherInviteRegistrationSchema), registerTeacherWithInvite)
          .post("/login", validate(loginSchema), login)
          .get("/me", authorizeUser, me)

export default authRouter;
