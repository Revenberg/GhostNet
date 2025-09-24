import React, { useEffect, useState } from "react";

const STATUS_OPTIONS = ["", "init", "start", "finished"];

export default function GameEngine() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [status, setStatus] = useState("init");
    const [teams, setTeams] = useState([]);
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Extract all routePoints and points from teams for table rendering


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
            const res = await fetch(`${backendHost}/api/game_engine/pointsstatus?game_id=${gameId}`);
            const data = await res.json();
            if (data.success) {
                setTeams(data.teams);
                setPoints(data.points);
            } else {
                setTeams([]);
                setPoints([]);
            }
        } catch {
            setTeams([]);
            setPoints([]);
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
            
            const res = await fetch(`${backendHost}/api/game_engine/target`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ game_id: selectedGame, team_id: team_id, game_point_id: team_id.game_route_points_id })
            });            
            const data = await res.json();
            if (data.success) setMessage("Target marked as done");
            else setMessage("Failed to update target");
            
            const res2 = await fetch(`${backendHost}/api/game_engine/sendTeamTargetPoint`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ game_id: selectedGame, team_id: team_id  })
            });            
            const data2 = await res2.json();
            if (data2.success) setMessage("Message send to team(" + team_id + "): " + (data2.message || ""));
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
            {loading ? <div>Laden...</div> : null}
            {/* Table rendering would go here */}
            {/* Always show the points table */}
            <table className="w-full border-collapse text-xs md:text-sm mt-4">
                <thead>
                    <tr>
                        <th className="border-b p-2">Locatie &amp; Omschrijving</th>
                        {teams.map(team => (
                            <th key={team.team_id} className="border-b p-2 text-center">{team.teamname}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {points.map((point) => (
                        <tr key={point.id}>
                            <td className="border px-2 py-1 text-xs font-semibold bg-gray-100">
                                <div><span className="font-bold">{point.location}</span></div>
                                <div>{point.description}</div>
                            </td>
                            {teams.map((team, teamIdx) => {
                                const teamStatus = point.teams.find(t => t.team_id === team.team_id);
                                let cellClass = "border px-2 py-1 text-xs text-center";
                                let textStyle = {};
                                let showLink = false;
                                if (teamStatus) {
                                    if (teamStatus.status === "target") {
                                        textStyle.fontWeight = "bold";
                                        showLink = true;
                                    } else if (teamStatus.status === "done") {
                                        textStyle.color = "#b0b0b0"; // light gray
                                    }
                                }
                                return (
                                    <td key={String(point.id) + '-' + team.team_id + '-' + teamIdx} className={cellClass}>
                                        {teamStatus ? (
                                            <span style={textStyle}>
                                                {teamStatus.order_id ? `${teamStatus.order_id}. ` : ''}
                                                {!showLink && (teamStatus.status || 'pending')}
                                                {showLink && (
                                                    <>
                                                        <a
                                                            href="#"
                                                            style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: 4, fontWeight: 'normal' }}
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                handleTargetDone(team.team_id, point.id);
                                                            }}
                                                        >
                                                            Zet op gedaan
                                                        </a>
                                                    </>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            {message && <div className="mt-4 text-sm text-green-700">{message}</div>}
        </div>
    );
}
