import express from "express";

export default function createGamesRouter(pool) {
  // Create a new game (status = 'new')
  router.post("/", async (req, res) => {
    try {
      const { game_id, name } = req.body;
      if (!game_id || !name) {
        return res.status(400).json({ error: "game_id and name required" });
      }
      const [result] = await pool.query(
        "INSERT INTO game (game_id, name, status) VALUES (?, ?, ?)",
        [game_id, name, 'new']
      );
      res.json({ success: true, id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Update game status
  router.put("/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "status required" });
      }
      const [result] = await pool.query(
        "UPDATE game SET status = ? WHERE id = ?",
        [status, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // List all games
  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM game");
      res.json({ success: true, games: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });
  const router = express.Router();

  // Get all team_events for a team, sorted by event_timestamp
  router.get("/events/:team_id", async (req, res) => {
    try {
      const { team_id } = req.params;
      const [rows] = await pool.query(
        "SELECT * FROM team_events WHERE team_id = ? or team_id = 0 ORDER BY event_timestamp DESC",
        [team_id]
      );
      res.json({ success: true, events: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  router.post("/events/:team_id", async (req, res) => {
    try {
      const { team_id } = req.params;
      const { event_type, event_message } = req.body;
      if (!team_id || !event_type || !event_message) {
        return res.status(400).json({ error: "team_id, event_type and event_message required" });
      }
      const [result] = await pool.query(
        "INSERT INTO team_events (team_id, event_type, event_message) VALUES (?, ?, ?)",
        [team_id, event_type, event_message]
      );
      res.json({ success: true, id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

// Example: Get all games
  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM games");
      res.json({ success: true, games: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
}
