import React, { useState, useEffect } from "react";
import RequireRole from "../../components/RequireRole";

export default function GamesProgressOverview() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGames() {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      try {
        const res = await fetch(`${backendHost}/api/games`);
        const data = await res.json();
        if (res.ok && data.success) setGames(data.games);
      } catch {}
    }
    fetchGames();
  }, []);

  useEffect(() => {
    if (!selectedGame) return;
    async function fetchProgress() {
      setLoading(true);
      setError("");
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      try {
        const res = await fetch(`${backendHost}/api/games/progress/by-game-latest/${selectedGame}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProgress(data.progress);
        } else {
          setError("Fout bij ophalen voortgang");
        }
      } catch {
        setError("Serverfout");
      }
      setLoading(false);
    }
    fetchProgress();
  }, [selectedGame]);

  return (
    <RequireRole role="admin">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Game voortgang per team</h2>
        <select
          className="w-full border px-3 py-2 rounded mb-4"
          value={selectedGame}
          onChange={e => setSelectedGame(e.target.value)}
        >
          <option value="">Selecteer een game...</option>
          {games.map(game => (
            <option key={game.id} value={game.id}>{game.name} (ID: {game.id})</option>
          ))}
        </select>
        {loading ? (
          <p>Laden...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : selectedGame && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">Team ID</th>
                <th className="border-b p-2 text-left">Status</th>
                <th className="border-b p-2 text-left">Laatste update</th>
              </tr>
            </thead>
            <tbody>
              {progress.map(row => (
                <tr key={row.team_id}>
                  <td className="border-b p-2">{row.team_id}</td>
                  <td className="border-b p-2">{row.status}</td>
                  <td className="border-b p-2">{row.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </RequireRole>
  );
}
