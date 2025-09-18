// DJB2 hash function (matches C++ version)
function hashPassword(password) {
  let hash = 5381;
  for (let i = 0; i < password.length; ++i) {
    hash = ((hash << 5) + hash) + password.charCodeAt(i);
    hash = hash >>> 0; // force unsigned 32-bit
  }
  return hash.toString(16);
}

import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import usersRouter from "./routes/users.js";
import teamsRouter from "./routes/teams.js";

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Config
const dbConfig = {
  host: process.env.MYSQL_HOST || "mysql",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "rootpassword",
  database: process.env.MYSQL_DATABASE || "ghostnet",
};

let pool;

// Retry MySQL connection
async function initMySQL(retries = 10, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      pool = await mysql.createPool(dbConfig);
      await pool.query("SELECT 1");
      console.log("✅ MySQL connected");
      return;
    } catch (err) {
      console.error(`❌ MySQL connection failed (attempt ${i + 1}/${retries}):`, err.message);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}

// All API endpoints removed

// All API endpoints removed

// Server will start after successful DB connection
initMySQL()
  .then(() => {
    // Mount routers with pool and hashPassword
    app.use("/api/users", usersRouter(pool, hashPassword));
    app.use("/api/teams", teamsRouter(pool));
    app.listen(PORT, () => {
      console.log(`✅ Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Could not connect to MySQL after retries:", err);
    process.exit(1);
  });
