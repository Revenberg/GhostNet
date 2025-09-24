import React, { useEffect, useState } from "react";

export default function RankingSummary() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState("");
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchGames() {
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                const res = await fetch(`${backendHost}/api/games`);
                const data = await res.json();
                if (res.ok && data.success) {
                    setGames(data.games);
                }
            } catch {
                setGames([]);
            }
        }
        fetchGames();
    }, []);

    useEffect(() => {
        if (!selectedGame) return;
        setLoading(true);
        setError("");
        async function fetchSummary() {
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                const res = await fetch(`${backendHost}/api/game_engine/ranking_summary?game_id=${selectedGame}`);
                const data = await res.json();
                if (data.success) {
                    setSummary(data.summary);
                } else {
                    setSummary([]);
                    setError("Failed to fetch summary");
                }
            } catch {
                setSummary([]);
                setError("Failed to fetch summary");
            }
            setLoading(false);
        }
        fetchSummary();
    }, [selectedGame]);

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Ranking Summary</h2>
            <div className="mb-4 flex items-center gap-4">
                <label className="font-semibold mr-2">Game:</label>
                <select
                    className="border px-2 py-1 rounded"
                    value={selectedGame}
                    onChange={e => setSelectedGame(e.target.value)}
                >
                    <option value="">-- Select a game --</option>
                    {games.map(game => (
                        <option key={game.id} value={game.id}>{game.id} - {game.name}</option>
                    ))}
                </select>
            </div>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {summary.length > 0 && (
                <table className="w-full border-collapse text-xs md:text-sm mt-4">
                    <thead>
                        <tr>
                            <th className="border-b p-2 text-left">Team</th>
                            <th className="border-b p-2 text-center">Ranking Count</th>
                            <th className="border-b p-2 text-center">Bonus Count</th>
                            <th className="border-b p-2 text-center">Bonus Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.map(team => (
                            <tr key={team.team_id}>
                                <td className="border px-2 py-1">{team.teamname}</td>
                                <td className="border px-2 py-1 text-center">{team.ranking_count}</td>
                                <td className="border px-2 py-1 text-center">{team.bonus_count}</td>
                                <td className="border px-2 py-1 text-center">{team.bonus_total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {summary.length === 0 && !loading && !error && selectedGame && (
                <div className="text-gray-500 mt-4">No ranking data for this game.</div>
            )}
        </div>
    );
}
