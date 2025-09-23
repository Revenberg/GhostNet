import React, { useEffect, useState } from "react";

const STATUS_OPTIONS = ["", "init", "start", "finished"];

export default function GameEngine() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [status, setStatus] = useState("init");
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Extract all routePoints and points from teams for table rendering
    const routePoints = React.useMemo(() => {
        // Collect all route points from all teams
        const allPoints = teams.flatMap(team => team.points || []);
        // Unique by route_point_id or id
        const unique = [];
        const seen = new Set();
        for (const pt of allPoints) {
            const key = pt.route_point_id || pt.id;
            if (!seen.has(key)) {
                unique.push({
                    id: pt.route_point_id || pt.id,
                    order_id: pt.order_id,
                    description: pt.description
                });
                seen.add(key);
            }
        }
        // Sort by order_id if present
        return unique.sort((a, b) => (a.order_id || 0) - (b.order_id || 0));
    }, [teams]);

    const points = React.useMemo(() => teams.flatMap(team => team.points || []), [teams]);

    useEffect(() => {
        async function fetchGames() {
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                const res = await fetch(`${backendHost}/api/games`);
                const data = await res.json();
                if (res.ok && data.success) {
                    setGames(data.games);
                }
            } catch { }
        }
        fetchGames();
    }, []);

    // Fetch teams and their points for selected game
    const fetchTeams = async (gameId) => {
        if (!gameId) return;
        setLoading(true);
        try {
            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
            const res = await fetch(`${backendHost}/api/game_engine/current?game_id=${gameId}`);
            const data = await res.json();
            if (data.success) setTeams(data.teams);
            else setTeams([]);
        } catch {
            setTeams([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedGame) fetchTeams(selectedGame);
    }, [selectedGame]);


    // Store status when button is clicked
    const handleStoreStatus = async () => {
        setMessage("");
        if (!status || !selectedGame || STATUS_OPTIONS.length === 0) return;
        if (status === "init" || status === "start") {
            setLoading(true);

            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                const res = await fetch(`${backendHost}/api/game_engine/${status}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ game_id: selectedGame })
                });
                const data = await res.json();
                if (data.success) setMessage(`Game ${status} !`);
                else setMessage("Failed to change game status: " + (data.error || "Unknown error"));
                fetchTeams(selectedGame);
            } catch (err) {
                setMessage("Failed to change game status: " + (err?.message || "Unknown error"));
            }
            setLoading(false);
        }
        // Add logic for other statuses if needed
    };

    // Mark a target as done
    const handleTargetDone = async (team_id, game_point_id) => {
        setLoading(true);
        setMessage("");
        try {
            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
            console.log("Marking done:", { game_id: selectedGame, team_id, game_point_id });
            console.log("Marking done:", { team_id });

            const res = await fetch(`${backendHost}/api/game_engine/target`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ game_id: selectedGame, team_id: team_id, game_point_id: team_id.game_route_points_id })
            });
            const data = await res.json();
            if (data.success) setMessage("Target marked as done");
            else setMessage("Failed to update target");
            fetchTeams(selectedGame);
        } catch {
            setMessage("Failed to update target");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Game Engine</h2>
            <div className="mb-4 flex items-center gap-4">
                <label className="font-semibold mr-2">Game:</label>
                <select
                    className="border px-2 py-1 rounded"
                    value={selectedGame || ""}
                    onChange={e => setSelectedGame(Number(e.target.value))}
                >
                    <option value="">-- Kies een game --</option>
                    {games.map(game => (
                        <option key={game.id} value={game.id}>{game.id} - {game.name}</option>
                    ))}
                </select>
                <label className="font-semibold ml-6 mr-2">Status:</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="border px-2 py-1 rounded">
                    {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <button
                    className="btn-primary px-4 py-1 ml-2"
                    onClick={handleStoreStatus}
                    disabled={!status || !selectedGame || STATUS_OPTIONS.length === 0}
                >
                    Opslaan
                </button>
            </div>
            Opslaan
            {loading ? <div>Laden...</div> : (
                <div>Opgeslagen!</div>
            )}
            {message && <div className="mt-4 text-sm text-green-700">{message}</div>}
        </div>
    );
}
