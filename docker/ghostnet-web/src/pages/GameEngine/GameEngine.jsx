import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000/api/game_engine";
const GAME_ID = 2; // You can make this dynamic if needed
const STATUS_OPTIONS = ["init", "start", "finished"];

export default function GameEngine() {
  const [status, setStatus] = useState("init");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch teams and their points
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/current?game_id=${GAME_ID}`);
      const data = await res.json();
      if (data.success) setTeams(data.teams);
      else setTeams([]);
    } catch {
      setTeams([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Handle status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setMessage("");
    if (newStatus === "start") {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game_id: GAME_ID })
        });
        const data = await res.json();
        if (data.success) setMessage("Game started!");
        else setMessage("Failed to start game");
        fetchTeams();
      } catch {
        setMessage("Failed to start game");
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
        body: JSON.stringify({ game_id: GAME_ID, team_id, game_point_id })
      });
      const data = await res.json();
      if (data.success) setMessage("Target marked as done");
      else setMessage("Failed to update target");
      fetchTeams();
    } catch {
      setMessage("Failed to update target");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Game Engine</h2>
      <div className="mb-4">
        <label className="font-semibold mr-2">Status:</label>
        <select value={status} onChange={handleStatusChange} className="border px-2 py-1 rounded">
          {STATUS_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
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
