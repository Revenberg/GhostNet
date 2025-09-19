import React, { useState, useEffect } from "react";
import RequireRole from "../../components/RequireRole";

export default function GamesUpdate() {
  const [form, setForm] = useState({ id: "", status: "" });
  const [message, setMessage] = useState("");
  const [games, setGames] = useState([]);
  const selectedGame = games.find(g => String(g.id) === String(form.id));

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("...verzenden");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/games/${form.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: form.status }),
      });
      if (res.ok) {
        setMessage("✅ Status bijgewerkt!");
        setForm({ id: "", status: "" });
      } else {
        setMessage("❌ Fout bij bijwerken");
      }
    } catch (err) {
      setMessage("❌ Serverfout");
    }
  };

  return (
    <RequireRole role="admin">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Game status bijwerken</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <select
            name="id"
            value={form.id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Selecteer een game...</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.id} - {game.name}
              </option>
            ))}
          </select>
          {selectedGame && (
            <div className="text-sm text-gray-600 mb-2">Huidige status: <span className="font-mono">{selectedGame.status}</span></div>
          )}
          <input
            type="text"
            name="status"
            placeholder="Nieuwe status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button type="submit" className="w-full btn-primary">Bijwerken</button>
        </form>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </RequireRole>
  );
}
