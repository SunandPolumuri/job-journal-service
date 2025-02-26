import pool from "../config/db.js";
import Joi from "joi";

export const getAllJobs = async (req, res, next) => {
    try {
        const { user_id } = req.user
        const getJobsQuery = "SELECT * FROM jobs WHERE user_id=$1"

        const result = await pool.query(getJobsQuery, [user_id])
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