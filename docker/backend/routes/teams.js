import express from "express";

export default function createTeamsRouter(pool) {
  const router = express.Router();
  // ...existing code...

  // Get team by id (must be last)
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query("SELECT id, teamname, teamcode FROM teams WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json({ success: true, team: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });
  
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
      const { teamname, game_id } = req.body;
      if (!teamname) {
        return res.status(400).json({ error: "Team name is required" });
      }
      const teamcode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const [result] = await pool.query(
        "INSERT INTO teams (teamname, teamcode, game_id) VALUES (?, ?, ?)",
        [teamname, teamcode, game_id || null]
      );
      // Create a team event for creation
      const team_id = result.insertId;
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
      const { teamname, teamcode, game_id } = req.body;
      if (!teamname || !teamcode) {
        return res.status(400).json({ error: "Team name and code required" });
      }
      const [result] = await pool.query(
        "UPDATE teams SET teamname = ?, teamcode = ?, game_id = ? WHERE id = ?",
        [teamname, teamcode, game_id || null, id]
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

  /**
   * DELETE /api/teams/:id
   * Verwijder een team op basis van id.
   *
   * Request params:
   *   - id: het team-id (number)
   * Response:
   *   - 200: { success: true }
   *   - 404: { error: "Team not found" }
   *   - 500: { error: "Database error" }
   */
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


  // Get all teams, or by game_id if provided
  router.get("/", async (req, res) => {
    try {
      const { game_id } = req.query;
      let rows;
      if (game_id) {
        [rows] = await pool.query(
          "SELECT id, game_id, teamname, teamcode FROM teams WHERE game_id = ?",
          [game_id]
        );
      } else {
        [rows] = await pool.query("SELECT id, game_id, teamname, teamcode FROM teams");
      }
      res.json({ success: true, teams: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
}
