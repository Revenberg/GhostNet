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
    router.get("/pointsstatus", async (req, res) => {
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
            // Get all points for this game, with all teams' status/order for each point
            const [allPoints] = await pool.query(
                `SELECT gep.*, grp.location, grp.description FROM game_engine_points gep JOIN game_route_points grp ON gep.game_route_points_id = grp.id WHERE gep.game_id = ? ORDER BY gep.game_route_points_id, gep.team_id`,
                [game_id]
            );

            // Map: points as rows, each with array of {team_id, status, order_id}
            const pointMap = new Map();
            for (const row of allPoints) {
                if (!pointMap.has(row.game_route_points_id)) {
                    pointMap.set(row.game_route_points_id, {
                        id: row.game_route_points_id,
                        location: row.location,
                        description: row.description,
                        teams: []
                    });
                }
                pointMap.get(row.game_route_points_id).teams.push({
                    team_id: row.team_id,
                    status: row.status,
                    order_id: row.order_id
                });
            }
            const points = Array.from(pointMap.values());

            // Map: teams as columns, each with array of points
            const teamMap = new Map();
            for (const row of allPoints) {
                if (!teamMap.has(row.team_id)) {
                    teamMap.set(row.team_id, {
                        team_id: row.team_id,
                        points: []
                    });
                }
                teamMap.get(row.team_id).points.push({
                    point_id: row.game_route_points_id,
                    status: row.status,
                    order_id: row.order_id
                });
            }
            const teamsWithPoints = Array.from(teamMap.values());

            // Also return teams for headers
            const teamList = teams.map(t => ({ team_id: t.id, teamname: t.teamname }));

            res.json({ success: true, points, teams: teamList, teamsWithPoints });
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

            // 0. check if status = target, if not error
            const [[pointRow]] = await pool.query(
                `SELECT status, order_id FROM game_engine_points WHERE game_id = ? AND team_id = ? AND game_route_points_id = ?`,
                [game_id, team_id, game_point_id]
            );
            if (!pointRow || pointRow.status !== 'target') {
                return res.status(400).json({ error: "Point is not the current target for this team." });
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

            // Set next point to 'target'
            await pool.query(
                `UPDATE game_engine_points SET status = 'target', starttms = NOW() 
                WHERE game_id = ? AND team_id = ? AND order_id = ?`,
                [game_id, team_id, pointRow.order_id + 1]
            );
            res.json({ success: true, team_id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    });
 
    router.post("/sendTeamTargetPoint", async (req, res) => {
    try {
            const { game_id, team_id } = req.body;
            if (!game_id || !team_id) {
                return res.status(400).json({ error: "game_id and team_id are required" });
            }
                   
            const [[nextPointRow]] = await pool.query(
                `SELECT grp.* FROM game_engine_points as gep, game_route_points as grp 
                WHERE  gep.game_route_points_id = grp.id
                and gep.game_id = ? AND gep.team_id = ? AND gep.status = 'target'`,
                [game_id, team_id]
            );
            nextDescription = nextPointRow ? nextPointRow.description : "Onbekend";

            // 4. Get game name
            const [[gameRow]] = await pool.query(
                `SELECT name FROM game WHERE id = ?`,
                [game_id]
            );
            const gameName = gameRow ? gameRow.name : "";

            let message = `Game '${gameName}': next target is ${nextDescription || 'none'}`;

            // 5. Send event to team
            await pool.query(
                `INSERT INTO team_events (team_id, event_type, event_message)
         VALUES (?, 'next_target', ?)`,
                [team_id, message]
            );
            res.json({ success: true, team_id, message: message });
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
                    `SELECT DISTINCT gr.id as route_id, p.id as point_id, o.order_id as order_id, gr.game_id, grt.team_id
                     FROM game_routes gr
                     JOIN game_route_team grt ON grt.game_route_id = gr.id
                     JOIN game_route_order o ON o.game_route_id = gr.id
                     JOIN game_route_points p ON o.game_route_points_id = p.id
                     WHERE gr.game_id = ? AND grt.team_id = ?
                     ORDER BY grt.team_id, o.order_id ASC`,
                    [game_id, team.id]
                );
                    
                await pool.query(
                    `DELETE gep FROM game_engine_points gep
                    JOIN game_route_order o ON gep.game_route_points_id = o.game_route_points_id
                    WHERE gep.team_id = ? AND gep.game_id = ?`,
                      [team.id, game_id]  
                );
                let order_counter = 0;
                for (const route of routes) {
                    // Select all points for this route, ordered
                    order_counter ++;
                    
                    await pool.query(
                        `INSERT INTO game_engine_points (game_id, team_id, game_route_points_id, status, order_id)
                            VALUES (?, ?, ?, 'todo', ?)`,
                        [route.game_id, route.team_id, route.point_id, order_counter]
                    );
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
/*
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
*/
                    await pool.query(
                        `UPDATE game_engine_points SET status = 'target', starttms = NOW() WHERE order_id = 1 and game_id = ?`,
                        [game_id]
                    );
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error" });
        }
    });


    return router;
}
