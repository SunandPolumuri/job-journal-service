import { Router } from "express"
import { addJob, deleteJob, getAllJobs, getJobById, updateJob } from "../controller/jobController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = Router()

router.get("/getAllJobs/", authMiddleware, getAllJobs)
router.get("/getJobById/:job_id", authMiddleware, getJobById)
router.post("/addJob", authMiddleware, addJob)
router.put("/updateJob/:job_id", authMiddleware, updateJob)
router.delete("/deleteJob/:job_id", authMiddleware, deleteJob)

export default router