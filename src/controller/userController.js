import pool from "../config/db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Joi from "joi"

// export const getAllUsers = async (req, res, next) => {
//     try {
//         const queryText = "SELECT name, email, created_at FROM users"
//         const users = await pool.query(queryText)
//         if (users.rows.length > 0) {
//             res.json({
//                 users: users.rows
//             })
//         } else {
//             throw new Error("No users found!!!")
//         }
//     } catch (err) {
//         next(err)
//     }
// }

export const createUser = async (req, res, next) => {
    try {
        const { name, email, password, } = req.body

        const createUserSchema = Joi.object({
            name: Joi.string().alphanum().min(3).max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(5).max(20).required()
        })

        const { error } = createUserSchema.validate(req.body)
        if(error) {
            return res.status(400).json({
                message: error.message
            })
        }

        const existingUserQuery = "SELECT * FROM users WHERE email=$1"
        const existingUser = await pool.query(existingUserQuery, [email])
        if(existingUser.rows.length > 0) {
            return res.json({
                message: "User already exists!"
            })
        }

        const insertUserQuery = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING user_id, name, email"
        const passwordHash = await bcrypt.hash(password, 10)
        const insertUser = await pool.query(insertUserQuery, [name, email, passwordHash])
        if(insertUser.rows.length > 0) {
            res.json({
                user: insertUser.rows[0]
            })
        } else {
            throw new Error("Unable to insert user")
        }
    } catch (err) {
        next(err)
    }
}

export const login = async (req, res, next) => {

    try {
        const { email, password } = req.body

        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })

        const { error } = loginSchema.validate(req.body)
        if(error) {
            return res.status(400).json({
                message: error.message
            })
        }

        const checkUserQuery = "SELECT * FROM users WHERE email=$1"
        const user = await pool.query(checkUserQuery, [email])
        if(user.rows.length === 0) {
            return res.status(400).json({message: "User not found"})
        }

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password)
        if(!isPasswordValid) {
            return res.status(401).json({message: "Incorrect password"})
        }

        const userDetails = {
            name: user.rows[0].name,
            user_id: user.rows[0].user_id,
            email: user.rows[0].email
        }
        const token = jwt.sign(userDetails, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })
        res.cookie(
            "JWT-Token", token, {
                httpOnly: true,
                // sameSite: "Strict",
                expires: new Date(Date.now() + (60 * 60 * 1000))
            }
        )
        res.json({
            user_id: user.rows[0].user_id,
            name: user.rows[0].name,
            email: user.rows[0].email
        })
    } catch (err) {
        next(err)
    }
}

export const getUser = async (req, res, next) => {
    try {
        const { user } = req
        res.status(200).json({
            message: "User fetched successfully",
            user: user
        })
    } catch (err) {
        next(err)
    }
}

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("JWT-Token").json({message: "Successfully logged out!"})
    } catch (err) {
        next(err)
    }
}