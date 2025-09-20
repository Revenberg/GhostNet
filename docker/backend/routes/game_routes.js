import express from "express";

export default function createGameRoutesRouter(pool) {
  const router = express.Router();

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
      if (!game_route_points_id || !game_route_id || !order_id) {
        return res.status(400).json({ error: "game_route_id, game_route_points_id and order_id required" });
      }
      const [result] = await pool.query(
        `INSERT INTO game_route_order (game_route_id, game_route_points_id, order_id) VALUES (?, ?, ?)`,
        [game_route_id, game_route_points_id, order_id || 0]
      );
      res.json({ success: true, id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Get all routes for a game 
  router.get("/routes", async (req, res) => {
    try {
      const { game_id } = req.query;
      if (!game_id) {
        return res.status(400).json({ error: "game_id required" });
      }
      // Get all points for this game
      const [points] = await pool.query(
        `SELECT * FROM game_route_points WHERE game_id = ? ORDER BY id ASC`,
        [game_id]
      );
      // Get all route orders for this game, joined with route_name from game_routes
      const [orders] = await pool.query(
        `SELECT gro.*, gr.route_name
         FROM game_route_order gro
         JOIN game_routes gr ON gro.game_route_id = gr.id 
         WHERE gr.game_id = ?`,
        [game_id]
      );
      // Build a map: { [pointId]: [{ order_id, route_name }] }
      const pointRouteArr = {};
      orders.forEach(o => {
        if (!pointRouteArr[o.game_route_points_id]) pointRouteArr[o.game_route_points_id] = [];
        pointRouteArr[o.game_route_points_id].push({
          order_id: o.order_id,
          route_name: o.route_name
        });
      });
      // Compose result: for each point, if only one route, flatten; else, keep as array
      const result = points.map(p => {
        const routes = pointRouteArr[p.id] || [];
        if (routes.length === 1) {
          return {
            ...p,
            route_orders: routes[0].order_id,
            route_name: routes[0].route_name
          };
        } else if (routes.length > 1) {
          // If multiple routes, return arrays (or objects if needed)
          return {
            ...p,
            route_orders: routes.map(r => r.order_id),
            route_names: routes.map(r => r.route_name)
          };
        } else {
          return {
            ...p
          };
        }
      });
      res.json({ success: true, points: result });
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

  return router;
}
