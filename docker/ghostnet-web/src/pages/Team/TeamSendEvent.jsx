import React, { useState } from "react";
import RequireRole from "../../components/RequireRole";
import { getUserFromCookie } from "../../utils/auth";

export default function TeamSendEvent() {
  const [eventMsg, setEventMsg] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("...verzenden");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const user = getUserFromCookie();
      
      console.log("Current user:", user);  

      if (!user || !user.teamId) {
        setStatus("❌ Geen team gevonden voor deze gebruiker");
        return;
      }
      const team_id = user.teamId;

      console.log("Sending event to team_id:", team_id, "with message:", eventMsg);

      const res = await fetch(`${backendHost}/api/games/events/${team_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "Info", event_message: eventMsg })
      });

      if (res.ok) {
        setStatus("✅ Event verzonden!");
        setEventMsg("");
      } else {
        setStatus("❌ Fout bij verzenden");
      }
    } catch (err) {
      setStatus("❌ Serverfout");
    }
  };

  return (
    <RequireRole role="user">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Stuur een event naar je team</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <textarea
            className="w-full border px-3 py-2 rounded"
            rows={3}
            placeholder="Typ je event..."
            value={eventMsg}
            onChange={e => setEventMsg(e.target.value)}
            required
          />
          <button type="submit" className="w-full btn-primary">Verzenden</button>
        </form>
        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </RequireRole>
  );
}
