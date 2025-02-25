import { Router } from "express";
import { createUser, getAllUsers, login } from "../controller/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router()

router.get("/getAllUsers", authMiddleware, getAllUsers)
router.post("/createUser", createUser)
router.post("/login", login)

export default router