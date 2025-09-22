import express from "express";

export default function createGameRoutesRouter(pool) {
  const router = express.Router();

  // Ophalen van alle teams (details) voor een game_route_id
  router.get("/route-teams/details", async (req, res) => {
    try {
      const { game_route_id } = req.query;
      if (!game_route_id) {
        return res.status(400).json({ error: "game_route_id required" });
      }
      const [rows] = await pool.query(
        `SELECT t.* FROM game_route_team grt
         JOIN teams t ON grt.team_id = t.id
         WHERE grt.game_route_id = ?`,
        [game_route_id]
      );
      res.json({ success: true, teams: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Ophalen van alle team_ids voor een game_route_id
  router.get("/route-teams", async (req, res) => {
    try {
      const { game_route_id } = req.query;
      if (!game_route_id) {
        return res.status(400).json({ error: "game_route_id required" });
      }
      const [rows] = await pool.query(
        `SELECT team_id FROM game_route_team WHERE game_route_id = ?`,
        [game_route_id]
      );
      res.json({ success: true, team_ids: rows.map(r => r.team_id) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Set team_ids for a game_route_id (replace all, insert new, delete missing)
  router.post("/route-teams", async (req, res) => {
    try {
      const { game_route_id, team_ids } = req.body;
      if (!game_route_id || !Array.isArray(team_ids)) {
        return res.status(400).json({ error: "game_route_id and team_ids[] required" });
      }
      // 1. Haal bestaande team_ids op voor deze route
      const [rows] = await pool.query(
        `SELECT team_id FROM game_route_team WHERE game_route_id = ?`,
        [game_route_id]
      );
      const existing = new Set(rows.map(r => r.team_id));
      const wanted = new Set(team_ids.map(Number));
      // 2. Voeg toe wat nog niet bestaat
      for (const tid of wanted) {
        if (!existing.has(tid)) {
          await pool.query(
            `INSERT INTO game_route_team (game_route_id, team_id) VALUES (?, ?)`,
            [game_route_id, tid]
          );
        }
      }
      // 3. Verwijder wat niet meer gewenst is
      for (const tid of existing) {
        if (!wanted.has(tid)) {
          await pool.query(
            `DELETE FROM game_route_team WHERE game_route_id = ? AND team_id = ?`,
            [game_route_id, tid]
          );
        }
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

    // Create a new game_route_point
  router.post("/points", async (req, res) => {
    try {
      const { game_id, location, description, images, hints } = req.body;
      let { latitude, longitude } = req.body;
      latitude = parseFloat(latitude);
      if (isNaN(latitude)) latitude = 0;
      longitude = parseFloat(longitude);
      if (isNaN(longitude)) longitude = 0;

      if (!location || !game_id ) {
        return res.status(400).json({ error: "location and game Id required" });
      }
      const [result] = await pool.query(
        `INSERT INTO game_route_points (game_id, location, latitude, longitude, description, images, hints)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [game_id, location, latitude, longitude, description, images, hints]
      );
      res.json({ success: true, id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
});

  // Get all route points
    router.get("/points", async (req, res) => {
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

  // Delete a game_route_point by id
  router.delete("/points/:id", async (req, res) => {
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

  // Get all route points for a game
  router.get("/points/by-game/:game_id", async (req, res) => {
    try {
      const { game_id } = req.params;
      const [rows] = await pool.query(
        `SELECT * FROM game_route_points WHERE game_id = ? ORDER BY id ASC`,
        [game_id]
      );
      res.json({ success: true, points: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- GAME ROUTES MAINTAIN ENDPOINTS ---
  // Create a new game_routes entry
  router.post("/routes", async (req, res) => {
    try {
      const { game_route_id, game_route_points_id, order_id } = req.body;
      if (!game_route_points_id || !game_route_id || order_id === undefined) {
        return res.status(400).json({ error: "game_route_id, game_route_points_id and order_id required" });
      }
      // Check if entry exists
      const [rows] = await pool.query(
        `SELECT id FROM game_route_order WHERE game_route_id = ? AND game_route_points_id = ?`,
        [game_route_id, game_route_points_id]
      );
      let result;
        // Alleen insert/update als order_id > 0, anders clear of skip
        if (Number(order_id) > 0) {
          if (rows.length > 0) {
            // Update bestaande entry
            [result] = await pool.query(
              `UPDATE game_route_order SET order_id = ? WHERE game_route_id = ? AND game_route_points_id = ?`,
              [order_id, game_route_id, game_route_points_id]
            );
            return res.json({ success: true, updated: true });
          } else {
            // Insert nieuwe entry
            [result] = await pool.query(
              `INSERT INTO game_route_order (game_route_id, game_route_points_id, order_id) VALUES (?, ?, ?)`,
              [game_route_id, game_route_points_id, order_id]
            );
            return res.json({ success: true, id: result.insertId });
          }
        } else {
          // order_id <= 0: clear bestaande entry, geen insert
          if (rows.length > 0) {
            [result] = await pool.query(
              `UPDATE game_route_order SET order_id = 0 WHERE game_route_id = ? AND game_route_points_id = ?`,
              [game_route_id, game_route_points_id]
            );
            return res.json({ success: true, cleared: true });
          } else {
            return res.json({ success: true, skipped: true });
          }
        }
      if (rows.length > 0) {
        // Update existing
        [result] = await pool.query(
          `UPDATE game_route_order SET order_id = ? WHERE game_route_id = ? AND game_route_points_id = ?`,
          [order_id, game_route_id, game_route_points_id]
        );
        res.json({ success: true, updated: true });
      } else {
        // Insert new
     
        [result] = await pool.query(
          `INSERT INTO game_route_order (game_route_id, game_route_points_id, order_id) VALUES (?, ?, ?)`,
          [game_route_id, game_route_points_id, order_id]
        );
        res.json({ success: true, id: result.insertId });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Get route by game_route_id 
  router.get("/route", async (req, res) => {
    try {
      const { game_route_id } = req.query;
      if (!game_route_id) {
        return res.status(400).json({ error: "game_route_id required" });
      }
      // 1. Get game_id for this route
      const [[routeRow]] = await pool.query(
        `SELECT game_id FROM game_routes WHERE id = ?`,
        [game_route_id]
      );
      if (!routeRow) {
        return res.status(404).json({ error: "Route not found" });
      }
      const game_id = routeRow.game_id;
      const [rows] = await pool.query(
        `SELECT p.*, COALESCE(o.order_id, -1) AS order_id
         FROM game_route_points p
         LEFT JOIN game_route_order o
           ON o.game_route_points_id = p.id AND o.game_route_id = ?
         WHERE p.game_id = ?
         ORDER BY order_id ASC, p.id ASC`,
        [game_route_id, game_id]
      );
      res.json({ success: true, points: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

    // --- ROUTE ENDPOINTS ---
  // Create a new route (route metadata only)
  router.post("/", async (req, res) => {
    try {
      const { route_name, game_id } = req.body;
      if (!route_name || !game_id) {
        return res.status(400).json({ error: "route_name and game_id required" });
      }
      const [result] = await pool.query(
        `INSERT INTO game_routes (route_name, game_id) VALUES (?, ?)`,
        [route_name, game_id]
      );
      res.json({ success: true, id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // List all routes (optionally filter by game_id)
  router.get("/", async (req, res) => {
    try {
      const { game_id } = req.query;
      let query = `SELECT * FROM game_routes`;
      let params = [];
      if (game_id) {
        query += ` WHERE game_id = ?`;
        params.push(game_id);
      }
      query += ` ORDER BY lastupdate DESC`;
      const [rows] = await pool.query(query, params);
      res.json({ success: true, routes: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

    // Update route name
  router.put("/route/:id/name", async (req, res) => {
    try {
      const { id } = req.params;
      const { route_name } = req.body;
      if (!route_name) {
        return res.status(400).json({ error: "route_name required" });
      }
      const [result] = await pool.query(
        "UPDATE game_routes SET route_name = ? WHERE id = ?",
        [route_name, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Route not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
}
