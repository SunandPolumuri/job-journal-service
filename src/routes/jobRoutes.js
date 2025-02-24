import { Router } from "express"
import { addJob, getAllJobs, updateJob } from "../controller/jobController.js"

const router = Router()

router.get("/getAllJobs/:userId", getAllJobs)
router.post("/addJob", addJob)
router.put("/updateJob/:jobId", updateJob)

export default router