import { Router } from "express";
import { authorizeAdmin } from "../middleware/auth.middleware.js";
import {
<<<<<<< HEAD
=======
  createTeacherInvite,
  createUserByAdmin,
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  deleteUserById,
  getCurrentUserProfile,
  getUsers,
  getUsersById,
<<<<<<< HEAD
=======
  sendUserInvitation,
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  updateCurrentUserProfile,
} from "../controller/user.controller.js";



const userRouter=Router()

 userRouter.get("/profile", getCurrentUserProfile)
          .patch("/profile", updateCurrentUserProfile)
<<<<<<< HEAD
          .get("/users", authorizeAdmin, getUsers)
          .get("/users/:id", authorizeAdmin, getUsersById)
          .delete("/users/:id", authorizeAdmin, deleteUserById) 
=======
          .get("/", authorizeAdmin, getUsers)
          .post("/", authorizeAdmin, createUserByAdmin)
          .get("/:id", authorizeAdmin, getUsersById)
          .post("/:id/invite", authorizeAdmin, sendUserInvitation)
          .post("/teacher-invites", authorizeAdmin, createTeacherInvite)
          .delete("/:id", authorizeAdmin, deleteUserById) 
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
          

export default userRouter
