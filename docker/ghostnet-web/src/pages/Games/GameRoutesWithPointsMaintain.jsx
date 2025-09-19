
import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function GameRoutesWithPointsMaintain() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [points, setPoints] = useState([]);

  useEffect(() => {
    async function fetchGames() {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      try {
        const res = await fetch(`${backendHost}/api/games`);
        const data = await res.json();
        if (res.ok && data.success) setGames(data.games);
      } catch {}
    }
    fetchGames();
  }, []);

  useEffect(() => {
    if (!selectedGame) return setPoints([]);
    async function fetchPoints() {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      try {
        // Haal alle routes op voor deze game
        const resRoutes = await fetch(`${backendHost}/api/games/routes?game_id=${selectedGame}`);
        const dataRoutes = await resRoutes.json();
        if (!resRoutes.ok || !dataRoutes.success) return setPoints([]);
        const allPoints = [];
        for (const route of dataRoutes.routes) {
          const resPoints = await fetch(`${backendHost}/api/games/route-points/by-route/${route.id}`);
          const dataPoints = await resPoints.json();
          if (resPoints.ok && dataPoints.success) {
            allPoints.push(...dataPoints.points.map(p => ({ ...p, route_id: route.id, route_location: route.location })));
          }
        }
        setPoints(allPoints);
      } catch {}
    }
    fetchPoints();
  }, [selectedGame]);

  return (
    <RequireRole role="admin">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Game punten per game beheren</h2>
        <div className="mb-4">
          <select
            className="border px-3 py-2 rounded"
            value={selectedGame}
            onChange={e => { setSelectedGame(e.target.value); setPoints([]); }}
          >
            <option value="">Selecteer een game...</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name} (ID: {game.id})</option>
            ))}
          </select>
        </div>
        {selectedGame && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Route ID</th>
                <th className="border-b p-2">Route locatie</th>
                <th className="border-b p-2">Lat</th>
                <th className="border-b p-2">Lon</th>
                <th className="border-b p-2">Beschrijving</th>
                <th className="border-b p-2">Afbeeldingen</th>
                <th className="border-b p-2">Hints</th>
              </tr>
            </thead>
            <tbody>
              {points.map(point => (
                <tr key={point.id}>
                  <td className="border-b p-2">{point.route_id}</td>
                  <td className="border-b p-2">{point.route_location}</td>
                  <td className="border-b p-2">{point.latitude}</td>
                  <td className="border-b p-2">{point.longitude}</td>
                  <td className="border-b p-2">{point.description}</td>
                  <td className="border-b p-2">{point.images}</td>
                  <td className="border-b p-2">{point.hints}</td>
                </tr>
              ))}
              {points.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-500">Geen punten gevonden voor deze game.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </RequireRole>
  );
}
