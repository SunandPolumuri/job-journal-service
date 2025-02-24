import pool from "../config/db.js";

export const getAllJobs = async (req, res, next) => {
    // todo - Add JWT Authorization !!!!!
    // add validation

    try {
        const { userId } = req.params
        const getJobsQuery = "SELECT * FROM jobs WHERE user_id=$1"

        const result = await pool.query(getJobsQuery, [userId])
        if(result.rows.length === 0) {
            return res.status(404).json({message: "No jobs found for the user"})
        }
        res.json(result.rows)
    } catch (err) {
        next(err)
    }
}

export const addJob = async (req, res, next) => {
    try {
        const { user_id, company_name, job_role, status, job_platform, job_link, job_location, job_details } = req.body
        const insertJobQuery = `INSERT INTO jobs (user_id, company_name, job_role, status, job_platform, job_link, job_location, job_details) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`

        const result = await pool.query(insertJobQuery, [user_id, company_name, job_role, status, job_platform, job_link, job_location, job_details])
        if(result.rows.length > 0) {
            res.status(201).json({
                message: "Job added successfully!",
                jobDetails: result.rows[0]
            })
        } else {
            res.status(500).json({
                message: "Something went wrong"
            })
        }
    } catch (err) {
        next(err)
    }
}

export const updateJob = async (req, res, next) => {
    try {
        const { jobId } = req.params
        const updates = JSON.parse(JSON.stringify(req.body))
        const { user_id } = updates
        delete updates.user_id

        const jobExistsQuery = "SELECT * FROM jobs WHERE job_id=$1 AND user_id=$2"
        const job = await pool.query(jobExistsQuery, [jobId, user_id])
        if(job.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found or not authorized to update"
            })
        }

        const columns = []
        const values = []
        Object.keys(updates).forEach((col, index) => {
            col === 'job_details' ? columns.push(`${col}=COALESCE(job_details, '{}'::jsonb)|| $${index+1}`) : columns.push(`${col}=$${index+1}`)
            values.push(updates[col])
        });
        
        const updateJobQuery = `UPDATE jobs
                                SET ${columns.join(", ")}, updated_at=NOW()
                                WHERE user_id=$${columns.length+1} AND job_id=$${columns.length+2} RETURNING *`
        const result = await pool.query(updateJobQuery, [...values, user_id, jobId])
        if(result.rows.length > 0) {
            res.status(200).json({
                message: "Job updated successfully!"
            })
        } else {
            res.status(404).json({
                message: "Job not found or not authorized to update"
            })
        }
    } catch (err) {
        next(err)
    }
}