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
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

// Retry connectie met MySQL
async function initMySQL(retries = 10, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      pool = await mysql.createPool(dbConfig);
      await pool.query("SELECT 1");
      console.log("✅ MySQL connected");
      return;
    } catch (err) {
      console.error(
        `❌ MySQL connection failed (attempt ${i + 1}/${retries}):`,
        err.message
      );
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}

// API: Registratie
app.post("/api/register", async (req, res) => {
  try {
    const { username, teamname, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }


    const password_hash = hashPassword(password);
    // Generate a simple random alphanumeric token of max 50 chars
    function simpleToken(length = 50) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; ++i) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    const token = simpleToken(50);

    const [result] = await pool.query(
      "INSERT INTO users (username, teamname, password_hash, token) VALUES (?, ?, ?, ?)",
      [username, teamname, password_hash, token]
    );

    res.json({ success: true, id: result.insertId, token });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Username already exists" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  }
});

// API: Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = rows[0];
    const password_hash = hashPassword(password);
    if (user.password_hash !== password_hash) {
      return res.status(401).json({ error: "Invalid password" });
    }


    // Generate a simple random alphanumeric token of max 50 chars
    function simpleToken(length = 50) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; ++i) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    const token = simpleToken(50);

    await pool.query("UPDATE users SET token = ? WHERE id = ?", [
      token,
      user.id,
    ]);

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Server pas starten na succesvolle DB connectie
initMySQL()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Could not connect to MySQL after retries:", err);
    process.exit(1);
  });
