import { Router } from "express";
import { createUser, getUser, login, logout } from "../controller/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router()

// router.get("/getAllUsers", authMiddleware, getAllUsers)
router.post("/createUser", createUser)
router.post("/login", login)
router.post("/logout", logout)
router.get("/getuser", authMiddleware, getUser)

export default router