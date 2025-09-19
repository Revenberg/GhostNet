import express from "express";

export default function createGamesRouter(pool) {
  const router = express.Router();

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

  router.post("/events", async (req, res) => {
    try {
      const { team_id, event_type, event_message } = req.body;
      if (!team_id || !event_type || !event_message) {
        return res.status(400).json({ error: "team_id, event_type and event_message required" });
      }
      const [result] = await pool.query(
        "INSERT INTO team_events (team_id, event_type, event_message) VALUES (?, ?)",
        [team_id, event_type]
      );
      res.json({ success: true, id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
}
