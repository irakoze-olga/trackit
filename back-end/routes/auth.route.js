import { Router } from "express";
import { signup,login, me } from "../controller/auth.controller.js";
import { authorizeUser } from "../middleware/auth.middleware.js";

const authRouter=Router();

authRouter.post("/signup",signup)
          .post("/login",login)
          .get("/me", authorizeUser, me)

export default authRouter;
