import pool from "../config/db.js";
import Joi from "joi";

export const getAllJobs = async (req, res, next) => {
    try {
        const { user_id } = req.user
        const getJobsQuery = "SELECT * FROM jobs WHERE user_id=$1 ORDER BY updated_at DESC"

        const result = await pool.query(getJobsQuery, [user_id])
        res.json(result.rows)
    } catch (err) {
        next(err)
    }
}

export const addJob = async (req, res, next) => {
    try {
        const { company_name, job_role, status, job_platform, job_link, job_location, job_details } = req.body
        const { user_id } = req.user

        const jobSchema = Joi.object({
            company_name: Joi.string().required(),
            job_role: Joi.string().required(),
            status: Joi.string().required(),
            job_platform: Joi.string(),
            job_link: Joi.string().uri(),
            job_location: Joi.string(),
            job_details: Joi.object()
        })
        
        const { error } = jobSchema.validate(req.body)
        if(error) {
            return res.status(400).json({
                message: error.message
            })
        }

        const insertJobQuery = `INSERT INTO jobs (user_id, company_name, job_role, status, job_platform, job_link, job_location, job_details) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`
        
        const insertStatusQuery = `INSERT INTO status_updates (job_id, user_id, status) 
            VALUES ($1, $2, $3) RETURNING *`

        const result = await pool.query(insertJobQuery, [user_id, company_name, job_role, status, job_platform, job_link, job_location, job_details])
        
        if(result.rows.length > 0 && result.rows[0]?.job_id) {
            const insertStatusResult = await pool.query(insertStatusQuery, [result.rows[0]?.job_id, user_id, status])
        }

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
        const { job_id } = req.params
        const updates = JSON.parse(JSON.stringify(req.body))
        const { user_id } = req.user
        // const { user_id } = updates
        // delete updates.user_id

        const { error: jobIdError } = Joi.number().integer().positive().required().validate(job_id)

        const updateJobSchema = Joi.object({
            company_name: Joi.string(),
            job_role: Joi.string(),
            status: Joi.string(),
            job_platform: Joi.string(),
            job_link: Joi.string().uri(),
            job_location: Joi.string(),
            job_details: Joi.object()
        })

        if(jobIdError) {
            return res.status(400).json({
                message: "Invalid job ID"
            })
        }

        if(Object.keys(updates) < 1) {
            return res.status(400).json({
                message: "No update fields"
            })
        }
        
        const { error } = updateJobSchema.validate(req.body)
        if(error) {
            return res.status(400).json({
                message: error.message
            })
        }

        const jobExistsQuery = "SELECT * FROM jobs WHERE job_id=$1 AND user_id=$2"
        const job = await pool.query(jobExistsQuery, [job_id, user_id])
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
        const result = await pool.query(updateJobQuery, [...values, user_id, job_id])
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

export const getJobById = async (req, res, next) => {
    try {
        const { job_id } = req.params
        const { user_id } = req.user

        const { error } = Joi.number().integer().positive().required().validate(job_id)
        if(error) {
            return res.status(400).json({
                message: "Invalid job ID"
            })
        }

        const getJobByIdQuery = "SELECT * FROM jobs WHERE job_id=$1 AND user_id=$2"
        const result = await pool.query(getJobByIdQuery, [job_id, user_id])
        if(result.rows.length > 0) {
            return res.status(200).json({
                message: "Job retrieved successfully",
                job: result.rows[0]
            })
        }
        return res.status(404).json({ message: "Job not found or not authorized to access" })
    } catch {
        next(err)
    }
}

export const deleteJob = async (req, res, next) => {
    try {
        const { user_id } = req.user
        const { job_id } = req.params

        const { error } = Joi.number().integer().positive().required().validate(job_id)
        if(error) {
            return res.status(400).json({
                message: "Invalid job ID"
            })
        }

        const checkJobQuery = "SELECT * FROM jobs WHERE user_id=$1 AND job_id=$2"
        const job = await pool.query(checkJobQuery, [user_id, job_id])
        if(job.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found or you are not authorized to delete"
            })
        }

        const deleteJobQuery = "DELETE FROM jobs WHERE user_id=$1 AND job_id=$2"
        await pool.query(deleteJobQuery, [user_id, job_id])
        res.status(200).json({
            message: "Job deleted successfully"
        })
    } catch (err) {
        next(err)
    }
}

export const addStatus = async (req, res, next) => {
    try {
        const { user_id } = req.user
        const { job_id } = req.params

        const { error: jobIdError } = Joi.number().integer().positive().required().validate(job_id)

        const statusSchema = Joi.object({
            status: Joi.string().required(),
            additional_info: Joi.object()
        })
        
        const { error } = statusSchema.validate(req.body)

        if(jobIdError) {
            return res.status(400).json({
                message: "Invalid job ID"
            })
        }
        if(error) {
            return res.status(400).json({
                message: error.message
            })
        }

        const { status, additional_info } = req.body

        const jobExistsQuery = "SELECT * FROM jobs WHERE job_id=$1 AND user_id=$2"
        const job = await pool.query(jobExistsQuery, [job_id, user_id])
        if(job.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found or not authorized to update"
            })
        }

        const insertStatusQuery = `INSERT INTO status_updates (job_id, user_id, status, additional_info) 
                                    VALUES ($1, $2, $3, $4) RETURNING *`

        const updateStatusInJobs = `UPDATE jobs SET status = $1, updated_at = now() WHERE job_id = $2 AND user_id = $3`

        const insertResult = await pool.query(insertStatusQuery, [job_id, user_id, status, additional_info])
        const updateStatusInJobsRes = await pool.query(updateStatusInJobs, [status, job_id, user_id])

        if(insertResult.rows.length > 0) {
            res.status(201).json({
                message: "Status added successfully",
                status: insertResult.rows[0]
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

export const updateStatus = async (req, res, next) => {
    try {
        const { user_id } = req.user
        const { status_id } = req.params

        const { error: statusIdError } = Joi.number().integer().positive().required().validate(status_id)

        const statusSchema = Joi.object({
            additional_info: Joi.object().required()
        })

        const { error } = statusSchema.validate(req.body)

        if(statusIdError) {
            return res.status(400).json({
                message: "Invalid status ID"
            })
        }
        if(error) {
            return res.status(400).json({
                message: error.message
            })
        }

        const { additional_info } = req.body

        const statusExistsQuery = "SELECT * FROM status_updates WHERE status_id=$1 AND user_id=$2"
        const status = await pool.query(statusExistsQuery, [status_id, user_id])
        if(status.rows.length === 0) {
            return res.status(404).json({
                message: "Status not found or not authorized to update"
            })
        }

        const updateStatusQuery = `UPDATE status_updates SET 
            additional_info = $1, updated_at = now() 
            WHERE status_id = $2 AND user_id = $3 RETURNING *`

        const result = await pool.query(updateStatusQuery, [additional_info, status_id, user_id])
        if(result.rows.length > 0) {
            res.status(200).json({
                message: "Status updated successfully",
                status: result.rows[0]
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

export const getStatusTimeline = async (req, res, next) => {
    try {
        const { user_id } = req.user
        const { job_id } = req.params

        const { error } = Joi.number().integer().positive().required().validate(job_id)
        if(error) {
            return res.status(400).json({
                message: "Invalid job ID"
            })
        }

        const getStatusQuery = `SELECT status_id, status, additional_info, created_at, updated_at
             FROM status_updates WHERE user_id = $1 AND job_id = $2 ORDER BY created_at ASC`

        const result = await pool.query(getStatusQuery, [user_id, job_id])
        res.json(result?.rows)
    } catch (err) {
        next(err)
    }
}

export const getUpcomingInterviews = async (req, res, next) => {
    try {
        const { user_id } = req.user

        const getInterviewsQuery = `SELECT jobs.job_id, jobs.company_name, jobs.job_role, status_updates.additional_info FROM
            jobs INNER JOIN status_updates ON status_updates.job_id = jobs.job_id 
            WHERE (status_updates.additional_info->>'interview_date')::timestamp > now() 
            AND (status_updates.additional_info->>'interview_date')::timestamp < now() + INTERVAL '1 week'
            AND status_updates.user_id = $1 AND jobs.status = 'interview-scheduled'`
        const result = await pool.query(getInterviewsQuery, [user_id])
        res.json(result.rows)
    } catch (err) {
        next(err)
    }
}