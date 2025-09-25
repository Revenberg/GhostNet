import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UsersRegister() {
  const [form, setForm] = useState({
    username: "",
    teamcode: "",
    password: "",
  });
  const [teamValid, setTeamValid] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "teamcode" && value.length > 0) {
      // Valideer teamcode
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      try {
        const res = await fetch(`${backendHost}/api/teams/by-code/${encodeURIComponent(value)}`);
        if (res.ok) {
          setTeamValid(true);
        } else {
          setTeamValid(false);
        }
      } catch {
        setTeamValid(false);
      }
    } else if (name === "teamcode") {
      setTeamValid(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("...sending");

    // Valideer teamcode nogmaals voor submit
    const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    try {
      const resTeam = await fetch(`${backendHost}/api/teams/by-code/${encodeURIComponent(form.teamcode)}`);
      if (!resTeam.ok) {
        setMessage("❌ Ongeldige teamcode. Voer een bestaande code in.");
        setTeamValid(false);
        return;
      }
      setTeamValid(true);
      // Registreer gebruiker
      const res = await fetch(`${backendHost}/api/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, teamcode: form.teamcode }),
      });
      const data = await res.json();
      if (res.ok) {

        // Send event: user added to team
        const teamData = await resTeam.json();
        const team_id = teamData.team.id;
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const eventMsg = `Gebruiker ${form.username} toegevoegd aan team op ${dateStr}`;
        await fetch(`${backendHost}/api/games/events/${team_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_type: "Info", event_message: eventMsg })
        });

        setMessage("✅ Registration successful! Je wordt doorgestuurd naar de login pagina...");
        setTimeout(() => {
          navigate("/users-login");
        }, 2000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="teamcode"
          placeholder="Team code"
          value={form.teamcode}
          onChange={handleChange}
          className={`w-full border px-3 py-2 rounded ${teamValid === false ? 'border-red-500' : ''}`}
          required
        />
        {teamValid === false && (
          <p className="text-red-600 text-sm">Teamcode bestaat niet.</p>
        )}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button type="submit" className="w-full btn-primary">
          Create Account
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
