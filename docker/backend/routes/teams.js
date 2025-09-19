import express from "express";

export default function createTeamsRouter(pool) {

  // Create a new team event
  router.post("/events", async (req, res) => {
    try {
      const { team_id, event_type } = req.body;
      if (!team_id || !event_type) {
        return res.status(400).json({ error: "team_id and event_type required" });
      }
      const [result] = await pool.query(
        "INSERT INTO team_events (team_id, event_type) VALUES (?, ?)",
        [team_id, event_type]
      );
      res.json({ success: true, id: result.insertId });
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
  const router = express.Router();

  // Get team by teamname
  router.get("/by-name/:teamname", async (req, res) => {
    try {
      const { teamname } = req.params;
      const [rows] = await pool.query("SELECT id, teamname, teamcode FROM teams WHERE teamname = ?", [teamname]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json({ success: true, team: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Get all teams
  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, teamname, teamcode FROM teams");
      res.json({ success: true, teams: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

// Get team by teamcode
  router.get("/by-code/:teamcode", async (req, res) => {
    try {
      const { teamcode } = req.params;
      const [rows] = await pool.query("SELECT id, teamname, teamcode FROM teams WHERE teamcode = ?", [teamcode]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json({ success: true, team: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Add team
  router.post("/", async (req, res) => {
    try {
      const { teamname } = req.body;
      if (!teamname ) {
        return res.status(400).json({ error: "Team name is required" });
      }
      const teamcode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const [result] = await pool.query(
        "INSERT INTO teams (teamname, teamcode) VALUES (?, ?)",
        [teamname, teamcode]
      );
      // Create a team event for creation
      const team_id = result.insertId;
      await pool.query(
        "INSERT INTO team_events (team_id, event_type) VALUES (?, ?)",
        [team_id, 'created']
      );
      res.json({ success: true, id: team_id });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        res.status(400).json({ error: "Team name or code already exists" });
      } else {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      }
    }
  });

  // Update team
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { teamname, teamcode } = req.body;
      if (!teamname || !teamcode) {
        return res.status(400).json({ error: "Team name and code required" });
      }
      const [result] = await pool.query(
        "UPDATE teams SET teamname = ?, teamcode = ? WHERE id = ?",
        [teamname, teamcode, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json({ success: true });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        res.status(400).json({ error: "Team name or code already exists" });
      } else {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      }
    }
  });

  // Delete team
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        "DELETE FROM teams WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
}
