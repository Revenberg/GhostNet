import React, { useEffect, useState } from "react";


const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000/api/game_engine";
const STATUS_OPTIONS = ["", "init", "start", "finished"];


export default function GameEngine() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [status, setStatus] = useState("init");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchGames() {
      try {
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(`${backendHost}/api/games`);
        const data = await res.json();
        if (res.ok && data.success) {
          setGames(data.games);
        }
      } catch {}
    }
    fetchGames();
  }, []);

  // Fetch teams and their points for selected game
  const fetchTeams = async (gameId) => {
    if (!gameId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/current?game_id=${gameId}`);
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
        const res = await fetch(`${backendHost}/${status}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game_id: selectedGame })
        });
        const data = await res.json();
        if (data.success) setMessage("Game started!");
        else setMessage("Failed to change game status: " + (data.error || "Unknown error"));
        fetchTeams(selectedGame);
      } catch (err) {
        console.error(err);
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
      const res = await fetch(`${API_BASE}/target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: selectedGame, team_id, game_point_id })
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
        <table className="w-full border-collapse text-xs md:text-sm">
          <thead>
            <tr>
              <th className="border-b p-2">Team</th>
              <th className="border-b p-2">Routepunten</th>
              <th className="border-b p-2">Status</th>
              <th className="border-b p-2">Actie</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <React.Fragment key={team.team_id}>
                {team.points.map((point, idx) => (
                  <tr key={point.game_route_points_id}>
                    {idx === 0 && (
                      <td className="border-b p-2 font-semibold" rowSpan={team.points.length}>{team.teamname}</td>
                    )}
                    <td className="border-b p-2">{point.description}</td>
                    <td className="border-b p-2">{point.status}</td>
                    <td className="border-b p-2">
                      {point.status === "target" && (
                        <button className="btn-primary px-2 py-1" onClick={() => handleTargetDone(team.team_id, point.game_route_points_id)}>
                          Markeer als gedaan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
      {message && <div className="mt-4 text-sm text-green-700">{message}</div>}
    </div>
  );
}
