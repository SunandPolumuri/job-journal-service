import { Router } from "express";
import { createUser, getAllUsers, login } from "../controller/userController.js";

const router = Router()

router.get("/getAllUsers", getAllUsers)
router.post("/createUser", createUser)
router.post("/login", login)

export default router