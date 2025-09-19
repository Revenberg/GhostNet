import React, { useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function GamesCreate() {
  const [form, setForm] = useState({ game_id: "", name: "" });
  const [message, setMessage] = useState("");

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
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("✅ Game aangemaakt!");
        setForm({ game_id: "", name: "" });
      } else {
        setMessage("❌ Fout bij aanmaken");
      }
    } catch (err) {
      setMessage("❌ Serverfout");
    }
  };

  return (
    <RequireRole role="admin">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Nieuwe game aanmaken</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="game_id"
            placeholder="Game ID"
            value={form.game_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
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
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </RequireRole>
  );
}
