import express from "express";

export default function createGameEngineRoutesRouter(pool) {
    const router = express.Router();
    
    // Get game_engine_ranking for a game
    router.get("/ranking", async (req, res) => {
        try {
            const { game_id } = req.query;
            if (!game_id) {
                return res.status(400).json({ error: "game_id required" });
            }
            const [ranking] = await pool.query(
                `SELECT r.id, r.team_id, t.teamname, r.game_route_points_id, grp.description, r.game_points, r.game_bonus_task
                 FROM game_engine_ranking r
                 JOIN teams t ON r.team_id = t.id
                 JOIN game_route_points grp ON r.game_route_points_id = grp.id
                 WHERE r.game_id = ?
                 ORDER BY r.game_points DESC, r.id ASC`,
                [game_id]
            );
            res.json({ success: true, ranking });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    });
    // Get all teams and their routepoints (description and status) for a game
    router.get("/current", async (req, res) => {
        try {
            const { game_id } = req.query;
            if (!game_id) {
                return res.status(400).json({ error: "game_id required" });
            }
            // Get all teams for this game
            const [teams] = await pool.query(
                `SELECT id, teamname FROM teams WHERE game_id = ?`,
                [game_id]
            );
            // For each team, get their routepoints (description and status)
            const results = [];
            for (const team of teams) {
                const [points] = await pool.query(
                    `SELECT gep.game_route_points_id, gep.order_id, grp.description, gep.status
                     FROM game_engine_points gep
                     JOIN game_route_points grp ON gep.game_route_points_id = grp.id
                     WHERE gep.game_id = ? AND gep.team_id = ?
                     ORDER BY gep.id ASC`,
                    [game_id, team.id]
                );
                results.push({ team_id: team.id, teamname: team.teamname, points });
            }
            res.json({ success: true, teams: results });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    });

    // Mark a point as completed and advance to next target
    router.post("/target", async (req, res) => {
        try {
            const { game_id, team_id, game_point_id } = req.body;
            if (!game_id || !team_id || !game_point_id) {
                return res.status(400).json({ error: "game_id, team_id, and game_point_id required" });
            }

            // 1. Add entry to game_engine_ranking
            await pool.query(
                `INSERT INTO game_engine_ranking (game_id, team_id, game_route_points_id, game_points)
         VALUES (?, ?, ?, 100)`,
                [game_id, team_id, game_point_id]
            );

            // 2. Update current point to 'done'
            await pool.query(
                `UPDATE game_engine_points SET status = 'done', endtms = NOW()
         WHERE game_id = ? AND team_id = ? AND game_route_points_id = ?`,
                [game_id, team_id, game_point_id]
            );

            // 3. Find the next point for this team (the next 'todo' with the lowest id)
            const [[nextPoint]] = await pool.query(
                `SELECT gep.id as gep_id, grp.description
         FROM game_engine_points gep
         JOIN game_route_points grp ON gep.game_route_points_id = grp.id
         WHERE gep.game_id = ? AND gep.team_id = ? AND gep.status = 'todo'
         ORDER BY gep.id ASC LIMIT 1`,
                [game_id, team_id]
            );
            let nextDescription = null;
            if (nextPoint) {
                // Set next point to 'target'
                await pool.query(
                    `UPDATE game_engine_points SET status = 'target' WHERE id = ?`,
                    [nextPoint.gep_id]
                );
                nextDescription = nextPoint.description;
            }

            // 4. Get game name
            const [[gameRow]] = await pool.query(
                `SELECT name FROM game WHERE id = ?`,
                [game_id]
            );
            const gameName = gameRow ? gameRow.name : "";

            // 5. Send event to team
            await pool.query(
                `INSERT INTO team_events (team_id, event_type, event_message)
         VALUES (?, 'next_target', ?)`,
                [team_id, `Game '${gameName}': next target is ${nextDescription || 'none'}`]
            );

            res.json({ success: true, team_id, next_target: nextDescription });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    });

    // Initilize a game: initialize state, assign routes, notify teams
    router.post("/init", async (req, res) => {
        try {
            const { game_id } = req.body;
            if (!game_id) {
                return res.status(400).json({ error: "game_id required" });
            }

            // 1. Set game state to 'initialized' (assuming a 'state' column exists)
            await pool.query(
                `UPDATE game SET status = 'initialized' WHERE id = ? and status = ''`,
                [game_id]
            );

            // 2. Select all teams for this game
            const [teams] = await pool.query(
                `SELECT t.* FROM teams t WHERE t.game_id = ?`,
                [game_id]
            );

            // 3. For each team, assign route and insert into game_engine_points
            for (const team of teams) {
                // Select all unique routes for this team
                const [routes] = await pool.query(
                    `SELECT DISTINCT gr.id as route_id, o.order_id as order_id
                     FROM game_routes gr
                     JOIN game_route_team grt ON grt.game_route_id = gr.id
                     JOIN game_route_order o ON o.game_route_id = gr.id
                     WHERE gr.game_id = ? AND grt.team_id = ?
                     ORDER BY o.order_id ASC`,
                    [game_id, team.id]
                );
                                
                for (const route of routes) {
                    // Delete old game_engine_points for this route and team
                    await pool.query(
                        `DELETE gep FROM game_engine_points gep
                        JOIN game_route_order o ON gep.game_route_points_id = o.game_route_points_id
                        WHERE o.game_route_id = ? AND gep.team_id = ? AND gep.game_id = ?`,
                        [route.route_id, team.id, game_id]
                    );
                    // Select all points for this route, ordered
                    const [points] = await pool.query(
                        `SELECT p.id as point_id FROM game_route_order o
                            JOIN game_route_points p ON o.game_route_points_id = p.id
                            WHERE o.game_route_id = ?
                            ORDER BY o.order_id ASC` ,
                        [route.route_id]
                    );
                    // Insert each point for this team into game_engine_points
                    for (const point of points) {
                        await pool.query(
                            `INSERT INTO game_engine_points (game_id, team_id, order_id, game_route_points_id, status)
                               VALUES (?, ?, ?, ?, 'todo')`,
                            [game_id, team.id, route.grp_order_id, point.point_id]
                        );
                    }
                }
                // Send event: you joined game (insert into team_events)
                await pool.query(
                    `INSERT INTO team_events (team_id, event_type, event_message)
                       VALUES (?, 'message', JSON_OBJECT('game_id', ?, 'game_name', (SELECT name FROM game WHERE id = ?)))`,
                    [team.id, game_id, game_id]
                );
            }

            res.json({ success: true, teams });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    });

    // Start the game: set state, notify teams, set first point as target
    router.post("/start", async (req, res) => {
        try {
            const { game_id } = req.body;
            if (!game_id) {
                return res.status(400).json({ error: "game_id required" });
            }

            await pool.query(
                `UPDATE game SET status = 'started' WHERE id = ? and status = 'initialized'`,
                [game_id]
            );

            const [teams] = await pool.query(
                `SELECT t.* FROM teams t WHERE t.game_id = ?`,
                [game_id]
            );

            const [[gameRow]] = await pool.query(
                `SELECT name FROM game WHERE id = ?`,
                [game_id]
            );
            const gameName = gameRow ? gameRow.name : "";

            const results = [];
            for (const team of teams) {
                // Find the first point for this team (lowest order_id)
                const [[firstPoint]] = await pool.query(
                    `SELECT gep.id as gep_id, grp.location, grp.description
           FROM game_engine_points gep
           JOIN game_route_points grp ON gep.game_route_points_id = grp.id
           WHERE gep.game_id = ? AND gep.team_id = ? AND gep.status = 'todo'
           ORDER BY gep.order_id, gep.id ASC LIMIT 1`,
                    [game_id, team.id]
                );
                let targetDescription = null;
                if (firstPoint) {
                    // Update status to 'target'
                    await pool.query(
                        `UPDATE game_engine_points SET status = 'target' WHERE id = ?`,
                        [firstPoint.gep_id]
                    );
                    targetDescription = firstPoint.description;
                }
                // Send event: game started, first target
                await pool.query(
                    `INSERT INTO team_events (team_id, event_type, event_message)
           VALUES (?, 'game_start', ?)`,
                    [team.id, `Game '${gameName}' started. First target: ${targetDescription || 'none'}`]
                );
                results.push({ team_id: team.id, teamname: team.teamname, target: targetDescription });
            }

            res.json({ success: true, teams: results });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    });


    return router;
}
