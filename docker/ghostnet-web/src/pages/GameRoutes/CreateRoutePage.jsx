import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";
import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

// Zorgt dat alle order_id's > 0 uniek zijn binnen een route door dubbelen te verhogen
function fixDoubles(pointsList, routeId) {
    let changed = false;
    // Kopieer de lijst zodat we niet muteren
    let newPoints = pointsList.map(p => ({ ...p, route_orders: { ...p.route_orders } }));
    // Verzamel alle order_id's > 0
    let used = {};
    for (let idx = 0; idx < newPoints.length; idx++) {
        const p = newPoints[idx];
        const oid = p.route_orders?.[routeId];
        if (oid > 0) {
            if (!used[oid]) used[oid] = [];
            used[oid].push(idx);
        }
    }
    // Zoek dubbele
    for (const [oid, idxs] of Object.entries(used)) {
        if (idxs.length > 1) {
            // Laat de eerste staan, verhoog de rest
            for (let i = 1; i < idxs.length; i++) {
                let next = Number(oid) + 1;
                // Zoek een vrij nummer
                while (used[next] && used[next].length > 0) {
                    next++;
                }
                newPoints[idxs[i]].route_orders[routeId] = next;
                if (!used[next]) used[next] = [];
                used[next].push(idxs[i]);
                changed = true;
            }
        }
    }
    // Als er iets veranderd is, recursief opnieuw controleren
    if (changed) {
        return fixDoubles(newPoints, routeId);
    }
    return { pointsList: newPoints, changed: false };
}

export default function CreateRoutePage() {
    // ...existing state...
    const [savingRoute, setSavingRoute] = useState(false);
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null); // route object or null
    const [points, setPoints] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [routeName, setRouteName] = useState("");

    useEffect(() => {
        async function fetchGames() {
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                const res = await fetch(`${backendHost}/api/games`);
                const data = await res.json();
                if (res.ok && data.success) setGames(data.games);
            } catch { }
        }
        fetchGames();
    }, []);

    // Fetch routes for selected game
    useEffect(() => {
        if (!selectedGame) {
            setRoutes([]);
            setSelectedRoute(null);
            setRouteName("");
            return;
        }
        async function fetchRoutes() {
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                const res = await fetch(`${backendHost}/api/game_routes?game_id=${selectedGame.id}`);
                const data = await res.json();
                if (res.ok && data.success) setRoutes(data.routes);
            } catch { }
        }
        fetchRoutes();
    }, [selectedGame]);

    useEffect(() => {
        if (!selectedGame) {
            setPoints([]);
            return;
        }
        async function fetchPoints() {
            setLoading(true);
            setMessage("");
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                // Fetch points for each route
                const allRoutePoints = {};
                await Promise.all(routes.map(async route => {
                    const res = await fetch(`${backendHost}/api/game_routes/route?game_route_id=${route.id}`);
                    const data = await res.json();
                    if (res.ok && data.success) {
                        allRoutePoints[route.id] = data.points;
                    } else {
                        allRoutePoints[route.id] = [];
                    }
                }));
                // Merge all points by point id, collect order_id per route
                const pointsMap = {};
                routes.forEach(route => {
                    (allRoutePoints[route.id] || []).forEach(p => {
                        if (!pointsMap[p.id]) {
                            pointsMap[p.id] = { ...p, route_orders: {} };
                        }
                        pointsMap[p.id].route_orders[route.id] = p.order_id;
                    });
                });
                setPoints(Object.values(pointsMap));
            } catch {
                setPoints([]);
            }
            setLoading(false);
        }
        fetchPoints();
    }, [selectedGame, selectedRoute, routes]);

    // Geen sortering, gebruik volgorde uit DB
    const shownPoints = points;

    // Opslaan van alle order_id's tegelijk
    const handleSaveAllOrders = async () => {
        setMessage("Alles opslaan...");
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        let errors = [];
        await Promise.all(shownPoints.map(async point => {
            await Promise.all(routes.map(async route => {
                let order_id = (point.route_orders && point.route_orders[route.id]) || "";
                if (order_id === undefined || order_id === null || order_id === "") order_id = 99;
                try {
                    const res = await fetch(`${backendHost}/api/game_routes/routes`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            game_route_id: route.id,
                            game_route_points_id: point.id,
                            order_id: order_id
                        })
                    });
                    if (!res.ok) {
                        let errMsg = `Fout bij punt ${point.id}, route ${route.id}<br />`;
                        try {
                            const data = await res.json();
                            if (data && data.error) errMsg += `: ${data.error}`;
                        } catch { }
                        errors.push(errMsg);
                    }
                } catch (err) {
                    errors.push(`Netwerkfout bij punt ${point.id}, route ${route.route_name}`);
                }
            }));
        }));
        if (errors.length > 0) {
            setMessage("❌ Fouten bij opslaan:\n" + errors.join("\n"));
        } else {
            setMessage("✅ Alle volgordes opgeslagen");
        }
    };

    // Save new route
    const handleSaveRoute = async () => {
        if (!routeName || !selectedGame) return;
        setSavingRoute(true);
        setMessage("");
        try {
            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
            const res = await fetch(`${backendHost}/api/game_routes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ route_name: routeName, game_id: selectedGame.id })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMessage("✅ Route opgeslagen");
                // Refresh routes and select the new one
                const routesRes = await fetch(`${backendHost}/api/game_routes?game_id=${selectedGame.id}`);
                const routesData = await routesRes.json();
                if (routesRes.ok && routesData.success) {
                    setRoutes(routesData.routes);
                    const newRoute = routesData.routes.find(r => r.id === data.id);
                    setSelectedRoute(newRoute || null);
                }
            } else {
                setMessage("❌ Fout bij opslaan van route");
            }
        } catch {
            setMessage("❌ Fout bij opslaan van route");
        }
        setSavingRoute(false);
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
                    <span className="ml-4">Route naam:</span>
                    <input type="text" className="border px-2 py-1 rounded" value={routeName} onChange={e => setRouteName(e.target.value)} />
                    <button
                        className="btn-primary px-3 py-1 ml-2"
                        onClick={handleSaveRoute}
                        disabled={savingRoute || !routeName || !selectedGame}
                    >
                        Route opslaan
                    </button>
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
                                            {routes.map(route => (
                                                <th key={route.id} className="border-b p-2">
                                                    <div>{route.route_name}</div>
                                                    <div className="text-xs text-gray-500 font-normal">Volgorde:</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shownPoints.map(point => (
                                            <tr key={point.id}>
                                                <td className="border-b p-2">{point.id}</td>
                                                <td className="border-b p-2">{point.location}</td>
                                                <td className="border-b p-2">{point.latitude}</td>
                                                <td className="border-b p-2">{point.longitude}</td>
                                                <td className="border-b p-2">{point.description}</td>
                                                {routes.map(route => {
                                                    // Zoek order_id voor deze point in deze route
                                                    let order = (point.route_orders && point.route_orders[route.id]);
                                                    if (order === undefined || order === null || order === "" || Number(order) <= 0) order = "";
                                                    // Unieke key per point/route combinatie
                                                    return (
                                                        <td key={route.id} className="border-b p-2 text-center">
                                                            <input
                                                                type="number"
                                                                className="border px-1 py-0.5 rounded w-14 text-center"
                                                                value={order}
                                                                onChange={e => {
                                                                    // Update order in points state
                                                                    let newOrder = e.target.value;
                                                                    if (newOrder === "" || isNaN(Number(newOrder))) newOrder = 99;
                                                                    else newOrder = Number(newOrder);
                                                                    setPoints(prevPoints => {
                                                                        // Eerst aanpassen
                                                                        let updatedPoints = prevPoints.map(p => {
                                                                            if (p.id === point.id) {
                                                                                return {
                                                                                    ...p,
                                                                                    route_orders: {
                                                                                        ...p.route_orders,
                                                                                        [route.id]: newOrder
                                                                                    }
                                                                                };
                                                                            }
                                                                            return p;
                                                                        });
                                                                        // Daarna dubbelen oplossen
                                                                        let result = fixDoubles(updatedPoints, route.id);
                                                                        return result.pointsList;
                                                                    });
                                                                }}
                                                            />
                                                        </td>
                                                    );
                                                })}
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