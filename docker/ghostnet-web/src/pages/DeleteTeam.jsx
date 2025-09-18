import React, { useEffect, useState } from "react";

export default function DeleteTeam() {
  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState(null);
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

  const handleDelete = async () => {
    if (!selected) return;
    setMessage("...deleting");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/teams/${selected}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Team deleted!");
        setSelected(null);
        fetchTeams();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Delete Team</h2>
      <div className="mb-4">
        <label>Select a team:</label>
        <select className="ml-2 border rounded" onChange={e => setSelected(Number(e.target.value))} value={selected || ""}>
          <option value="">-- Select --</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.teamname}</option>
          ))}
        </select>
      </div>
      <button
        className="w-full btn-primary bg-red-600 hover:bg-red-700"
        onClick={handleDelete}
        disabled={!selected}
      >
        Delete Team
      </button>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
