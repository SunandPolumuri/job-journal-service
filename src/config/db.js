import pkg from "pg";
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pkg

let pool

if(!pool) {
    pool = new Pool({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT
    })
}

pool.on("connect", () => {
    console.log("DB connection successful!")
})

export default pool