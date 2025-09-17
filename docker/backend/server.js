import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connectie
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "mysql",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "rootpassword",
  database: process.env.MYSQL_DATABASE || "ghostnet",
});

// API: Registratie
app.post("/api/register", async (req, res) => {
  try {
    const { username, teamname, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate a random token (simple example)
    const token = require('crypto').randomBytes(32).toString('hex');

    // Insert user with token
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

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // JWT token maken
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1h" }
    );

    // token ook in DB opslaan (optioneel)
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

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

