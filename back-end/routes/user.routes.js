import { Router } from "express";
import { authorizeAdmin } from "../middleware/auth.middleware.js";
import {
  createTeacherInvite,
  createUserByAdmin,
  deleteUserById,
  getCurrentUserProfile,
  getUsers,
  getUsersById,
  sendUserInvitation,
  updateCurrentUserProfile,
} from "../controller/user.controller.js";



const userRouter=Router()

 userRouter.get("/profile", getCurrentUserProfile)
          .patch("/profile", updateCurrentUserProfile)
          .get("/", authorizeAdmin, getUsers)
          .post("/", authorizeAdmin, createUserByAdmin)
          .get("/:id", authorizeAdmin, getUsersById)
          .post("/:id/invite", authorizeAdmin, sendUserInvitation)
          .post("/teacher-invites", authorizeAdmin, createTeacherInvite)
          .delete("/:id", authorizeAdmin, deleteUserById) 
          

export default userRouter
