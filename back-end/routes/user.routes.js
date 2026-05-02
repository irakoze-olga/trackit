import { Router } from "express";
import { authorizeAdmin } from "../middleware/auth.middleware.js";
import {
  deleteUserById,
  getCurrentUserProfile,
  getUsers,
  getUsersById,
  updateCurrentUserProfile,
} from "../controller/user.controller.js";



const userRouter=Router()

 userRouter.get("/profile", getCurrentUserProfile)
          .patch("/profile", updateCurrentUserProfile)
          .get("/users", authorizeAdmin, getUsers)
          .get("/users/:id", authorizeAdmin, getUsersById)
          .delete("/users/:id", authorizeAdmin, deleteUserById) 
          

export default userRouter
