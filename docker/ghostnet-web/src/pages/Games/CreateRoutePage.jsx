import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function CreateRoutePage() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [points, setPoints] = useState([]);
    const [orderMap, setOrderMap] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchGames() {
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
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
            setLoading(true);
            setMessage("");
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                const res = await fetch(`${backendHost}/api/games/route-points/by-game/${selectedGame.id}`);
                const data = await res.json();
                if (res.ok && data.success) {
                    setPoints(data.points);
                    // Init orderMap
                    const om = {};
                    data.points.forEach(p => { om[p.id] = p.order_id || ""; });
                    setOrderMap(om);
                }
            } catch {}
            setLoading(false);
        }
        fetchPoints();
    }, [selectedGame]);

    const handleOrderChange = (id, value) => {
        setOrderMap({ ...orderMap, [id]: value });
    };

    const handleSaveOrder = async (id) => {
        setMessage("Opslaan...");
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        const order_id = orderMap[id];
        try {
            const res = await fetch(`${backendHost}/api/games/route-points/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id })
            });
            if (res.ok) setMessage("✅ Volgorde opgeslagen");
            else setMessage("❌ Fout bij opslaan");
        } catch {
            setMessage("❌ Fout bij opslaan");
        }
    };

    // Sorteer punten op order_id (of id als order_id ontbreekt)
    const sortedPoints = [...points].sort((a, b) => {
        const aOrder = orderMap[a.id] !== undefined && orderMap[a.id] !== "" ? Number(orderMap[a.id]) : (a.order_id || a.id);
        const bOrder = orderMap[b.id] !== undefined && orderMap[b.id] !== "" ? Number(orderMap[b.id]) : (b.order_id || b.id);
        return aOrder - bOrder;
    });

    // Opslaan van alle order_id's tegelijk
    const handleSaveAllOrders = async () => {
        setMessage("Alles opslaan...");
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        try {
            await Promise.all(sortedPoints.map(async point => {
                const order_id = orderMap[point.id];
                await fetch(`${backendHost}/api/games/routes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        game_id: selectedGame.id,
                        game_route_points_id: point.id,
                        order_id
                    })
                });
            }));
            setMessage("✅ Alle volgordes opgeslagen");
        } catch {
            setMessage("❌ Fout bij opslaan");
        }
    };

    return (
        <RequireRole role="admin">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">Route aanmaken / beheren</h2>
                <div className="mb-4">
                    <label className="font-semibold mr-2">Selecteer game:</label>
                    <select
                        className="border px-2 py-1 rounded"
                        value={selectedGame ? selectedGame.id : ""}
                        onChange={e => {
                            const game = games.find(g => g.id === Number(e.target.value));
                            setSelectedGame(game || null);
                        }}
                    >
                        <option value="">-- Kies een game --</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.id} - {game.name}</option>
                        ))}
                    </select>
                </div>
                {selectedGame && (
                    <div>
                        <h3 className="font-semibold mb-2">Routepunten voor deze game</h3>
                        {loading ? <div>Laden...</div> : (
                            <>
                            <table className="w-full border-collapse text-xs md:text-sm">
                                <thead>
                                    <tr>
                                        <th className="border-b p-2">ID</th>
                                        <th className="border-b p-2">Locatie</th>
                                        <th className="border-b p-2">Lat</th>
                                        <th className="border-b p-2">Lon</th>
                                        <th className="border-b p-2">Beschrijving</th>
                                        <th className="border-b p-2">Volgorde</th>
                                        <th className="border-b p-2">Huidige order_id</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedPoints.map(point => (
                                        <tr key={point.id}>
                                            <td className="border-b p-2">{point.id}</td>
                                            <td className="border-b p-2">{point.location}</td>
                                            <td className="border-b p-2">{point.latitude}</td>
                                            <td className="border-b p-2">{point.longitude}</td>
                                            <td className="border-b p-2">{point.description}</td>
                                            <td className="border-b p-2">
                                                <input
                                                    type="number"
                                                    className="border px-2 py-1 rounded w-16"
                                                    value={orderMap[point.id] || ""}
                                                    onChange={e => handleOrderChange(point.id, e.target.value)}
                                                />
                                            </td>
                                            <td className="border-b p-2 text-center">{point.order_id ?? ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4 flex justify-end">
                                <button className="btn-primary px-4 py-2" onClick={handleSaveAllOrders} disabled={loading}>
                                    Alle volgordes opslaan
                                </button>
                            </div>
                            </>
                        )}
                    </div>
                )}
                {message && <div className="mt-4 text-sm">{message}</div>}
            </div>
        </RequireRole>
    );
}
