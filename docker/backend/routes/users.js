import express from "express";

// DJB2 hash function for password hashing (matches C++ implementation)
export function hashPassword(password) {
  let hash = 5381;
  for (let i = 0; i < password.length; ++i) {
    hash = ((hash << 5) + hash) + password.charCodeAt(i);
    hash = hash >>> 0; // force unsigned 32-bit
  }
  return hash.toString(16);
}

export default function createUsersRouter(pool) {
  const router = express.Router();

  // Get all users (excluding password_hash and token)
  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, username, teamname, role FROM users");
      res.json({ success: true, users: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

   // Get user by token
  router.get("/by-token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const [rows] = await pool.query("SELECT id, username, teamname, role FROM users WHERE token = ?", [token]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, user: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Register
  router.post("/", async (req, res) => {
    try {
      const { username, teamname, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      const password_hash = hashPassword(password);
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
        "INSERT INTO users (username, teamname, role, password_hash, token) VALUES (?, ?, ?, ?, ?)",
        [username, teamname, "user", password_hash, token]
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

  router.post("/login", async (req, res) => {
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
      res.json({ success: true, user: {username: user.username, role: user.role, teamname: user.teamname, token: user.token } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
}
