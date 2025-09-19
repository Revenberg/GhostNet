import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

import { getUserFromCookie } from "../../utils/auth";

export default function MyTeam() {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTeam() {
      setLoading(true);
      setError("");
      try {
        const user = getUserFromCookie();
        if (!user) {
          setError("Geen gebruiker gevonden.");
          setLoading(false);
          return;
        }
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        // Fetch team info by teamname
        const res = await fetch(`${backendHost}/api/teams/by-name/${encodeURIComponent(user.teamname)}`);
        const data = await res.json();
        if (!res.ok || !data.team) {
          setError("Team niet gevonden.");
          setLoading(false);
          return;
        }
        setTeam(data.team);
        // Fetch all team members
        const resMembers = await fetch(`${backendHost}/api/users/by-team/${encodeURIComponent(data.team.teamname)}`);
        const dataMembers = await resMembers.json();
        setMembers(dataMembers.users || []);
      } catch (err) {
        setError("Serverfout bij ophalen team.");
      }
      setLoading(false);
    }
    fetchTeam();
  }, []);

  if (loading) return <div className="text-center">Laden...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;
  if (!team) return <div className="text-center">Geen team gevonden.</div>;

  return (
    <RequireRole role="user">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">{team.teamname}</h2>
        <div className="mb-4">
          <div><span className="font-semibold">Teamcode:</span> {team.teamcode}</div>
        </div>
        <h3 className="font-semibold mb-2">Teamleden:</h3>
        <ul className="list-disc list-inside">
          {members.map(member => (
            <li key={member.id}>{member.username}</li>
          ))}
        </ul>
      </div>
    </RequireRole>
  );
}
