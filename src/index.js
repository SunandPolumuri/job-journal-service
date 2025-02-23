import express from "express"
import cors from "cors"
import dotenv from "dotenv"
// import pool from "./config/db.js"
import userRouter from "./routes/userRoutes.js"

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// Middlewares

app.use(cors())
app.use(express.json())


// Routes

app.get("/", async (req, res) => {
    res.send('Hello World!')
    // const result = await pool.query("SELECT current_database()")
    // res.send(`Current database is ${result.rows[0].current_database}`)
})
app.use("/api/users", userRouter)


// Error Handling

app.use((error, req, res, next) => {
    error.statusCode = error.statusCode ?? 500
    error.status = error.status ?? "error"
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        errorStack: error
    })
})



// Start server

app.listen(port, () => {
    console.log(`App running on port ${port}`)
})
