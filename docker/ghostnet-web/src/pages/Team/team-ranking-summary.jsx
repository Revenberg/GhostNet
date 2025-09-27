import React, { useEffect, useState } from "react";

export default function RankingSummary() {
    const [selectedGame, setGame] = useState(
        typeof window !== 'undefined' ? sessionStorage.getItem('filterGameId') || '' : ''
    );
    const user = typeof window !== 'undefined' ? JSON.parse(decodeURIComponent((document.cookie.split('; ').find(row => row.startsWith('user=')) || '').split('=')[1] || 'null')) : null;
    const myTeamId = user && (user.teamId || user.team_id) ? (user.teamId || user.team_id) : null;
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchGame() {
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                // You need to get the actual team_id from user context, session, or props
                const user = typeof window !== 'undefined' ? JSON.parse(decodeURIComponent((document.cookie.split('; ').find(row => row.startsWith('user=')) || '').split('=')[1] || 'null')) : null;
                const team_id = user && user.teamId ? user.teamId : '';
                if (team_id) {
                    const res = await fetch(`${backendHost}/api/games/by-team/${team_id}`);
                    const data = await res.json();
                    if (data.success) {
                        setGame(data.games[0].id);
                    }
                }
            } catch {
                setGame(0);
            }
        }
        fetchGame();
    }, []);

    useEffect(() => {
        if (!selectedGame) return;
                const [nextTarget, setNextTarget] = useState(null);
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
                useEffect(() => {
                    async function fetchNextTarget() {
                        if (!selectedGame || !myTeamId) {
                            setNextTarget(null);
                            return;
                        }
                        try {
                            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                            const res = await fetch(`${backendHost}/api/game_engine/getTeamTargetPoint?game_id=${selectedGame}&team_id=${myTeamId}`);
                            const data = await res.json();
                            if (data.success && data.point && data.point.length > 0) {
                                setNextTarget(data.point[0]);
                            } else {
                                setNextTarget(null);
                            }
                        } catch {
                            setNextTarget(null);
                        }
                    }
                    fetchNextTarget();
                }, [selectedGame, myTeamId]);

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
            
            <h2 className="text-xl font-bold mb-4">Game overzicht</h2>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {summary.length > 0 && (
                <table className="w-full border-collapse text-xs md:text-sm mt-4">
                    <thead>
                        <tr>
                            <th className="border-b p-2 text-left">Team</th>
                            <th className="border-b p-2 text-center">Bereikte doelen</th>
                            <th className="border-b p-2 text-center"> </th>
                            <th className="border-b p-2 text-center">Bonus Count</th>
                            <th className="border-b p-2 text-center">Bonus Total</th>
                            <th className="border-b p-2 text-center">Strafpunten</th>
                            <th className="border-b p-2 text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary
                          .slice()
                          .sort((a, b) => (b.ranking_count * 100 + b.bonus_total - b.game_penalty) - (a.ranking_count * 100 + a.bonus_total - a.game_penalty))
                          .map(team => (
                            <tr key={team.team_id} className={myTeamId && team.team_id === Number(myTeamId) ? 'bg-yellow-200 font-bold' : ''}>
                                <td className="border px-2 py-1">{team.teamname}</td>
                        {nextTarget && (
                            <div className="mb-4 p-3 rounded bg-blue-100 border border-blue-300 text-blue-900">
                                <strong>Volgende target:</strong> {nextTarget.description}
                                {nextTarget.images && (
                                    <div className="mt-2">
                                        <img src={nextTarget.images} alt="Target" style={{ maxWidth: '100%', maxHeight: 200 }} />
                                    </div>
                                )}
                            </div>
                        )}
                                <td className="border px-2 py-1 text-center">{team.ranking_count}</td>
                                <td className="border px-2 py-1 text-center">{team.ranking_count} * 100</td>
                                <td className="border px-2 py-1 text-center">{team.bonus_count}</td>
                                <td className="border px-2 py-1 text-center">{team.bonus_total}</td>
                                <td className="border px-2 py-1 text-center">{team.game_penalty}</td>
                                <td className="border px-2 py-1 text-center">{
                                    (Number(team.ranking_count) * 100)
                                    + Number(team.bonus_total)
                                    - Number(team.game_penalty)
                                }</td>
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
