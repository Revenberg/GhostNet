import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function RouteTeamsPage() {
    const [routes, setRoutes] = useState([]);
    const [teams, setTeams] = useState([]);
    const [routeTeams, setRouteTeams] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchRoutesAndTeams() {
            setLoading(true);
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                const [routesRes, teamsRes] = await Promise.all([
                    fetch(`${backendHost}/api/game_routes`),
                    fetch(`${backendHost}/api/teams`)
                ]);
                const routesData = await routesRes.json();
                const teamsData = await teamsRes.json();
                if (routesData.success) setRoutes(routesData.routes);
                if (teamsData.success) setTeams(teamsData.teams);
            } catch (err) {
                setMessage("Fout bij ophalen van data");
            }
            setLoading(false);
        }
        fetchRoutesAndTeams();
    }, []);

    useEffect(() => {
        async function fetchAllRouteTeams() {
            if (!routes.length) return;
            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
            const newRouteTeams = {};
            await Promise.all(routes.map(async route => {
                const res = await fetch(`${backendHost}/api/game_routes/route-teams?game_route_id=${route.id}`);
                const data = await res.json();
                if (res.ok && data.success) newRouteTeams[route.id] = data.team_ids;
                else newRouteTeams[route.id] = [];
            }));
            setRouteTeams(newRouteTeams);
        }
        fetchAllRouteTeams();
    }, [routes]);

    const handleToggleTeam = async (routeId, teamId) => {
        const current = routeTeams[routeId] || [];
        const newSet = current.includes(teamId)
            ? current.filter(id => id !== teamId)
            : [...current, teamId];
        setRouteTeams(rt => ({ ...rt, [routeId]: newSet }));
        // Direct opslaan
        try {
            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
            const res = await fetch(`${backendHost}/api/game_routes/route-teams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ game_route_id: routeId, team_ids: newSet })
            });
            const data = await res.json();
            if (!data.success) setMessage("Fout bij opslaan");
        } catch {
            setMessage("Fout bij opslaan");
        }
    };

    return (
        <RequireRole role="admin">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">Teams per route beheren</h2>
                {loading ? <div>Laden...</div> : (
                    <table className="w-full border-collapse text-xs md:text-sm">
                        <thead>
                            <tr>
                                <th className="border-b p-2">Route</th>
                                {teams.map(team => (
                                    <th key={team.id} className="border-b p-2">{team.teamname}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {routes.map(route => (
                                <tr key={route.id}>
                                    <td className="border-b p-2 font-semibold">{route.route_name}</td>
                                    {teams.map(team => (
                                        <td key={team.id} className="border-b p-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={routeTeams[route.id]?.includes(team.id) || false}
                                                onChange={() => handleToggleTeam(route.id, team.id)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {message && <div className="mt-4 text-sm text-red-600">{message}</div>}
            </div>
        </RequireRole>
    );
}
