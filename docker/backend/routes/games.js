import express from "express";

export default function createGamesRouter(pool) {
  const router = express.Router();
  /*
  router.get("/progress/by-game-latest/:game_id", async (req, res) => {
    try {
      const { game_id } = req.params;
      // Get the latest progress entry per team for this game
      const [rows] = await pool.query(`
        SELECT gp.* FROM game_progress gp
        INNER JOIN (
          SELECT team_id, MAX(id) as max_id
          FROM game_progress
          WHERE game_id = ?
          GROUP BY team_id
        ) latest ON gp.id = latest.max_id
        WHERE gp.game_id = ?
        ORDER BY gp.lastupdate DESC
      `, [game_id, game_id]);
      res.json({ success: true, progress: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });
  */
  /*
   // Create a new game_progress entry
   router.post("/progress", async (req, res) => {
     try {
       const { game_id, team_id, status } = req.body;
       if (!game_id || !team_id || !status) {
         return res.status(400).json({ error: "game_id, team_id, and status required" });
       }
       const [result] = await pool.query(
         "INSERT INTO game_progress (game_id, team_id, status) VALUES (?, ?, ?)",
         [game_id, team_id, status]
       );
       res.json({ success: true, id: result.insertId });
     } catch (err) {
       console.error(err);
       res.status(500).json({ error: "Database error" });
     }
   });
 */
  // Update status for a game_progress entry
  router.put("/progress/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "status required" });
      }
      const [result] = await pool.query(
        "UPDATE game_progress SET status = ? WHERE id = ?",
        [status, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Progress entry not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });
  /*
    // List all game_progress for a game
    router.get("/progress/by-game/:game_id", async (req, res) => {
      try {
        const { game_id } = req.params;
        const [rows] = await pool.query(
          "SELECT * FROM game_progress WHERE game_id = ? order by team_id, lastupdate DESC",
          [game_id]
        );
        res.json({ success: true, progress: rows });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      }
    });
    */
  /*
    // List all game_progress for a team
    router.get("/progress/by-team/:team_id", async (req, res) => {
      try {
        const { team_id } = req.params;
        const [rows] = await pool.query(
          "SELECT * FROM game_progress WHERE team_id = ? order by game_id, lastupdate DESC",
          [team_id]
        );
        res.json({ success: true, progress: rows });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      }
    });
  */
  // Create a new game (status = 'new')
  router.post("/", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "name required" });
      }
      const [result] = await pool.query(
        "INSERT INTO game (name, status) VALUES (?, ?)",
        [name, 'new']
      );
      res.json({ success: true, id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Update game name
  router.put("/:id/name", async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "name required" });
      }
      const [result] = await pool.query(
        "UPDATE game SET name = ? WHERE id = ?",
        [name, id]
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

  // Delete a game
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        "DELETE FROM game WHERE id = ?",
        [id]
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

   // Get all team_events for a team, sorted by event_timestamp
  router.get("/by-team/:team_id", async (req, res) => {
    try {
      console.log("Get actual game for team_id:", req.params);
      const { team_id } = req.params;
      const [rows] = await pool.query(
        'SELECT game.* from game, teams where teams.id = ? and teams.game_id = game.id and status <> "new"',
        [team_id]
      );
      console.log("Actual games for team:", rows);
      res.json({ success: true, games: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Example: Get all games
  router.get("/:game_id", async (req, res) => {
    try {
      const { game_id } = req.params;
      if (!game_id) {
        return res.status(400).json({ error: "game_id required" });
      }
      const [rows] = await pool.query("SELECT * FROM game where id = ?", [game_id]);
      res.json({ success: true, games: rows });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM game");
      res.json({ success: true, games: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
}
