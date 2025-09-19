import React, { useState, useEffect } from "react";
import RequireRole from "../../components/RequireRole";

export default function GamesSetStatus() {
  const [form, setForm] = useState({ game_id: "", team_id: "", status: "" });
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchGamesAndTeams() {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      try {
        const resGames = await fetch(`${backendHost}/api/games`);
        const dataGames = await resGames.json();
        if (resGames.ok && dataGames.success) setGames(dataGames.games);
        const resTeams = await fetch(`${backendHost}/api/teams`);
        const dataTeams = await resTeams.json();
        if (resTeams.ok && dataTeams.success) setTeams(dataTeams.teams);
      } catch {}
    }
    fetchGamesAndTeams();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("...verzenden");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/games/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("✅ Status toegevoegd!");
        setForm({ game_id: "", team_id: "", status: "" });
      } else {
        setMessage("❌ Fout bij toevoegen");
      }
    } catch (err) {
      setMessage("❌ Serverfout");
    }
  };

  return (
    <RequireRole role="admin">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Status toevoegen aan game/team</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <select
            name="game_id"
            value={form.game_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Selecteer een game...</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name} (ID: {game.id})</option>
            ))}
          </select>
          <select
            name="team_id"
            value={form.team_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Selecteer een team...</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.teamname} (ID: {team.id})</option>
            ))}
          </select>
          <input
            type="text"
            name="status"
            placeholder="Status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button type="submit" className="w-full btn-primary">Toevoegen</button>
        </form>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </RequireRole>
  );
}
