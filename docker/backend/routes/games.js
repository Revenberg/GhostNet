import express from "express";

export default function createGamesRouter(pool) {
  // Create a new game (status = 'new')
  const router = express.Router();

  // Create a new game_route_point
  router.post("/route-points", async (req, res) => {
    try {
      const { location, latitude, longitude, description, images, hints } = req.body;
      if (!location || latitude == null || longitude == null) {
        return res.status(400).json({ error: "location, latitude, and longitude required" });
      }
      const [result] = await pool.query(
        `INSERT INTO game_route_points (location, latitude, longitude, description, images, hints)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [location, latitude, longitude, description, images, hints]
      );  

  // Get all route points (optionally filter by location)
  router.get("/route-points", async (res) => {
    try {
      let query = `SELECT * FROM game_route_points`;
      let params = [];
      query += ` ORDER BY id ASC`;
      const [rows] = await pool.query(query, params);
      res.json({ success: true, points: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });
      res.json({ success: true, id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Update a game_route_point by id
  router.put("/route-points/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { location, latitude, longitude, description, images, hints } = req.body;
      const [result] = await pool.query(
        `UPDATE game_route_points SET
          location = COALESCE(?, location),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          description = COALESCE(?, description),
          images = COALESCE(?, images),
          hints = COALESCE(?, hints)
         WHERE id = ?`,
        [location, latitude, longitude, description, images, hints, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Route point not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Delete a game_route_point by id
  router.delete("/route-points/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        `DELETE FROM game_route_points WHERE id = ?`,
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Route point not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Get all route points for a route
  router.get("/route-points/by-route/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const [rows] = await pool.query(
        `SELECT * FROM game_route_points WHERE location = ? ORDER BY id ASC`,
        [location]
      );
      res.json({ success: true, points: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- GAME ROUTES MAINTAIN ENDPOINTS ---
  // Get all routes for a game
  router.get("/routes", async (req, res) => {
    try {
      const { game_id } = req.query;
      let query = `SELECT * FROM game_routes`;
      let params = [];
      if (game_id) {
        query += ` WHERE game_id = ?`;
        params.push(game_id);
      }
      query += ` ORDER BY order_id ASC`;
      const [rows] = await pool.query(query, params);
      res.json({ success: true, routes: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });
  
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
      const [rows] = await pool.query("SELECT * FROM game order by lastupdate DESC");
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
      const [rows] = await pool.query("SELECT * FROM games order by lastupdate DESC");
      res.json({ success: true, games: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });   

  return router;
}
