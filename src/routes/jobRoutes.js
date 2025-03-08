import { Router } from "express"
import { addJob, addStatus, deleteJob, getAllJobs, getJobById, getStatusTimeline, getUpcomingInterviews, updateJob, updateStatus } from "../controller/jobController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = Router()

router.get("/getAllJobs/", authMiddleware, getAllJobs)
router.get("/getJobById/:job_id", authMiddleware, getJobById)
router.post("/addJob", authMiddleware, addJob)
router.put("/updateJob/:job_id", authMiddleware, updateJob)
router.delete("/deleteJob/:job_id", authMiddleware, deleteJob)
router.post("/addStatus/:job_id", authMiddleware, addStatus)
router.put("/updateStatus/:status_id", authMiddleware, updateStatus)
router.get("/getStatusTimeline/:job_id", authMiddleware, getStatusTimeline)
router.get("/getUpcomingInterviews/", authMiddleware, getUpcomingInterviews)

export default router