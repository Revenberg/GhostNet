import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function GamesList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setError("");
      try {
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(`${backendHost}/api/games`);
        const data = await res.json();
        if (res.ok && data.success) {
          setGames(data.games);
        } else {
          setError("Fout bij ophalen games");
        }
      } catch (err) {
        setError("Serverfout");
      }
      setLoading(false);
    }
    fetchGames();
  }, []);

  return (
    <RequireRole role="admin">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Alle games</h2>
        {loading ? (
          <p>Laden...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">ID</th>
                <th className="border-b p-2 text-left">Game ID</th>
                <th className="border-b p-2 text-left">Naam</th>
                <th className="border-b p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="border-b p-2">{game.id}</td>
                  <td className="border-b p-2">{game.game_id}</td>
                  <td className="border-b p-2">{game.name}</td>
                  <td className="border-b p-2">{game.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </RequireRole>
  );
}
