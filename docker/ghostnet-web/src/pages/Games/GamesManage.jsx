import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function GamesManage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "" });
  const [message, setMessage] = useState("");
  const [selectedGameId, setSelectedGameId] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('filterGameId') || '';
    }
    return '';
  });

  const fetchGames = async () => {
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
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("...verzenden");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (res.ok) {
        setMessage("✅ Game aangemaakt!");
        setForm({ name: "" });
        fetchGames();
      } else {
        setMessage("❌ Fout bij aanmaken");
      }
    } catch (err) {
      setMessage("❌ Serverfout");
    }
  };

  return (
    <RequireRole role="admin">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Games beheren</h2>
        <div className="mb-4">
          <label className="mr-2">Selecteer game:</label>
          <select
            value={selectedGameId}
            onChange={e => {
              setSelectedGameId(e.target.value);
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('filterGameId', e.target.value);
              }
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="">Alle games</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>
        <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Naam"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button type="submit" className="w-full btn-primary">Aanmaken</button>
        </form>
        {message && <p className="mt-2 text-sm">{message}</p>}
        <h3 className="text-lg font-semibold mb-2 mt-6">Alle games</h3>
        {loading ? (
          <p>Laden...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">ID</th>
                <th className="border-b p-2 text-left">Naam</th>
                <th className="border-b p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {games
                .filter(game => !selectedGameId || String(game.id) === String(selectedGameId))
                .map((game) => (
                  <tr key={game.id}>
                    <td className="border-b p-2">{game.id}</td>
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
