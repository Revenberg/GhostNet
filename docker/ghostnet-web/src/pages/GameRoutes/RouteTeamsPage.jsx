import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function RouteTeamsPage() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedId = sessionStorage.getItem('filterGameId');
            return storedId ? { id: Number(storedId) } : null;
        }
        return null;
    });
    const [routes, setRoutes] = useState([]);
    const [teams, setTeams] = useState([]);
    const [routeTeams, setRouteTeams] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchGamesTeamsRoutes() {
            setLoading(true);
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                // Always fetch games and routes, but only fetch teams if a game is selected
                const [gamesRes, routesRes] = await Promise.all([
                    fetch(`${backendHost}/api/games`),
                    fetch(`${backendHost}/api/game_routes`)
                ]);
                const gamesData = await gamesRes.json();
                const routesData = await routesRes.json();
                if (gamesData.success) setGames(gamesData.games);
                if (routesData.success) setRoutes(routesData.routes);
                // Na laden games, koppel geselecteerde game object als er een id in sessionStorage staat
                if (gamesData.success && gamesData.games && typeof window !== 'undefined') {
                    const storedId = sessionStorage.getItem('filterGameId');
                    if (storedId) {
                        const found = gamesData.games.find(g => String(g.id) === String(storedId));
                        if (found) setSelectedGame(found);
                    }
                }
                // Fetch teams for selected game only
                if (selectedGame && selectedGame.id) {
                    const teamsRes = await fetch(`${backendHost}/api/teams?game_id=${selectedGame.id}`);
                    const teamsData = await teamsRes.json();
                    if (teamsData.success) setTeams(teamsData.teams);
                    else setTeams([]);
                } else {
                    setTeams([]);
                }
            } catch (err) {
                setMessage("Fout bij ophalen van data");
                setTeams([]);
            }
            setLoading(false);
        }
        fetchGamesTeamsRoutes();
    }, [selectedGame]);

    useEffect(() => {
        async function fetchAllRouteTeams() {
            if (!routes.length) return;
            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
            const newRouteTeams = {};
            await Promise.all(routes.map(async route => {
                const res = await fetch(`${backendHost}/api/game_routes/route-teams?game_route_id=${route.id}`);
                const data = await res.json();
                if (res.ok && data.success) newRouteTeams[route.id] = data.team_ids;
                else newRouteTeams[route.id] = [];
            }));
            setRouteTeams(newRouteTeams);
        }
        fetchAllRouteTeams();
    }, [routes]);

    // Wijzigingen alleen lokaal bijhouden
    const handleToggleTeam = (routeId, teamId) => {
        const current = routeTeams[routeId] || [];
        const newSet = current.includes(teamId)
            ? current.filter(id => id !== teamId)
            : [...current, teamId];
        setRouteTeams(rt => ({ ...rt, [routeId]: newSet }));
    };

    // Opslaan van alle wijzigingen
    const handleSaveAll = async () => {
        setMessage("");
        setLoading(true);
        try {
            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
            // Sla alle routes in parallel op
            await Promise.all(Object.entries(routeTeams).map(async ([routeId, teamIds]) => {
                await fetch(`${backendHost}/api/game_routes/route-teams`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ game_route_id: routeId, team_ids: teamIds })
                });
            }));
            setMessage("✅ Opgeslagen");
        } catch {
            setMessage("Fout bij opslaan");
        }
        setLoading(false);
    };

    // Filter routes op geselecteerde game
    const shownRoutes = selectedGame ? routes.filter(r => r.game_id === selectedGame.id) : [];

    return (
        <RequireRole role="admin">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">Teams per route beheren</h2>
                <div className="mb-4">
                    <label className="font-semibold mr-2">Selecteer game:</label>
                    <select
                        className="border px-2 py-1 rounded"
                        value={selectedGame ? selectedGame.id : ''}
                        onChange={e => {
                            const game = games.find(g => g.id === Number(e.target.value));
                            setSelectedGame(game || null);
                            if (typeof window !== 'undefined') {
                                sessionStorage.setItem('filterGameId', e.target.value);
                            }
                        }}
                    >
                        <option value="">-- Kies een game --</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.id} - {game.name}</option>
                        ))}
                    </select>
                </div>
                {loading ? <div>Laden...</div> : (
                    <>
                    <table className="w-full border-collapse text-xs md:text-sm">
                        <thead>
                            <tr>
                                <th className="border-b p-2">Route</th>
                                {teams.map(team => (
                                    <th key={team.id} className="border-b p-2">{team.teamname}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {shownRoutes.map(route => (
                                <tr key={route.id}>
                                    <td className="border-b p-2 font-semibold">{route.route_name}</td>
                                    {teams.map(team => (
                                        <td key={team.id} className="border-b p-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={routeTeams[route.id]?.includes(team.id) || false}
                                                onChange={() => handleToggleTeam(route.id, team.id)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 flex justify-end">
                        <button className="btn-primary px-4 py-2" onClick={handleSaveAll} disabled={loading}>
                            Opslaan
                        </button>
                    </div>
                    </>
                )}
                {message && <div className="mt-4 text-sm text-red-600">{message}</div>}
            </div>
        </RequireRole>
    );
}
