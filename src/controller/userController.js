import pool from "../config/db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const getAllUsers = async (req, res, next) => {
    try {
        const queryText = "SELECT name, email, created_at FROM users"
        const users = await pool.query(queryText)
        if (users.rows.length > 0) {
            res.json({
                users: users.rows
            })
        } else {
            throw new Error("No users found!!!")
        }
    } catch (err) {
        next(err)
    }
}

export const createUser = async (req, res, next) => {
    try {
        const { name, email, password, } = req.body
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
            user_id: user.rows[0].user_id,
            email: user.rows[0].email
        }
        const token = jwt.sign(userDetails, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })
        res.cookie(
            "JWT-Token", token, {
                httpOnly: true,
                sameSite: "Strict"
            }
        ).json({
            user_id: user.rows[0].user_id,
            name: user.rows[0].name,
            email: user.rows[0].email
        })
    } catch (err) {
        next(err)
    }
}