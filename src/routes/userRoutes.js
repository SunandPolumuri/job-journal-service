import { Router } from "express";
import { createUser, login, logout } from "../controller/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router()

// router.get("/getAllUsers", authMiddleware, getAllUsers)
router.post("/createUser", createUser)
router.post("/login", login)
router.post("/logout", logout)

export default router