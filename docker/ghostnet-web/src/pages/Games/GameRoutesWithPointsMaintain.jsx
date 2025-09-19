import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function GameRoutesWithPointsMaintain() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [routes, setRoutes] = useState([]);
  const [points, setPoints] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");

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
    if (!selectedGame) return setRoutes([]);
    async function fetchRoutes() {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      try {
        const res = await fetch(`${backendHost}/api/games/routes?game_id=${selectedGame}`);
        const data = await res.json();
        if (res.ok && data.success) setRoutes(data.routes);
      } catch {}
    }
    fetchRoutes();
  }, [selectedGame]);

  useEffect(() => {
    if (!selectedRoute) return setPoints([]);
    async function fetchPoints() {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      try {
        const res = await fetch(`${backendHost}/api/games/route-points/by-route/${selectedRoute}`);
        const data = await res.json();
        if (res.ok && data.success) setPoints(data.points);
      } catch {}
    }
    fetchPoints();
  }, [selectedRoute]);

  return (
    <RequireRole role="admin">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Game routes & punten beheren</h2>
        <div className="mb-4 flex gap-4">
          <select
            className="border px-3 py-2 rounded"
            value={selectedGame}
            onChange={e => { setSelectedGame(e.target.value); setSelectedRoute(""); setPoints([]); }}
          >
            <option value="">Selecteer een game...</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name} (ID: {game.id})</option>
            ))}
          </select>
          <select
            className="border px-3 py-2 rounded"
            value={selectedRoute}
            onChange={e => setSelectedRoute(e.target.value)}
            disabled={!selectedGame}
          >
            <option value="">Selecteer een route...</option>
            {routes.map(route => (
              <option key={route.id} value={route.id}>{route.location || `Route ${route.id}`} (ID: {route.id})</option>
            ))}
          </select>
        </div>
        {selectedRoute && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
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
                  <td className="border-b p-2">{point.latitude}</td>
                  <td className="border-b p-2">{point.longitude}</td>
                  <td className="border-b p-2">{point.description}</td>
                  <td className="border-b p-2">{point.images}</td>
                  <td className="border-b p-2">{point.hints}</td>
                </tr>
              ))}
              {points.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-500">Geen punten gevonden voor deze route.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </RequireRole>
  );
}
