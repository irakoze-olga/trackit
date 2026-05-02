import { Router } from "express";
<<<<<<< HEAD
import { signup,login, me } from "../controller/auth.controller.js";
import { authorizeUser } from "../middleware/auth.middleware.js";

const authRouter=Router();

authRouter.post("/signup",signup)
          .post("/login",login)
=======
import { registerTeacherWithInvite, login, me } from "../controller/auth.controller.js";
import { authorizeUser } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.ts";
import { loginSchema, teacherInviteRegistrationSchema } from "../validations/auth.validation.ts";

const authRouter=Router();

authRouter.post("/teacher-invite", validate(teacherInviteRegistrationSchema), registerTeacherWithInvite)
          .post("/login", validate(loginSchema), login)
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
          .get("/me", authorizeUser, me)

export default authRouter;
