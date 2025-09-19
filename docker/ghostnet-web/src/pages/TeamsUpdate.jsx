import React, { useEffect, useState } from "react";
import RequireRole from "../components/RequireRole";

export default function TeamsUpdate() {
  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ teamname: "", teamcode: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/teams`);
      const data = await res.json();
      if (data.success) setTeams(data.teams);
    } catch {}
  }

  const handleSelect = (team) => {
    setSelected(team.id);
    setForm({ teamname: team.teamname, teamcode: team.teamcode });
    setMessage("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("...updating");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/teams/${selected}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Team updated!");
        fetchTeams();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  return (
    <RequireRole role="admin">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Update Team</h2>
        <div className="mb-4">
          <label>Select a team:</label>
          <select className="ml-2 border rounded" onChange={e => handleSelect(teams.find(t => t.id === Number(e.target.value)))} value={selected || ""}>
            <option value="">-- Select --</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.teamname}</option>
            ))}
          </select>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="teamname"
            placeholder="Team Name"
            value={form.teamname}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            name="teamcode"
            placeholder="Team Code"
            value={form.teamcode}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button type="submit" className="w-full btn-primary">
            Update Team
          </button>
        </form>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </RequireRole>
  );
}
