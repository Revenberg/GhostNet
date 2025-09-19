import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function AllRoutePointsOverview() {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchPoints() {
            setLoading(true);
            setError("");
            try {
                const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
                const res = await fetch(`${backendHost}/api/games/route-points`);
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.error || "Fout bij laden");
                setPoints(data.points);
            } catch (err) {
                setError(err.message || "Onbekende fout");
            } finally {
                setLoading(false);
            }
        }
        fetchPoints();
    }, []);

    return (
        <RequireRole role="admin">
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">Overzicht van alle routepunten</h2>
                {loading ? (
                    <div>Laden...</div>
                ) : error ? (
                    <div className="text-red-600">{error}</div>
                ) : (
                    <table className="w-full border-collapse text-xs md:text-sm">
                        <thead>
                            <tr>
                                <th className="border-b p-2">ID</th>
                                <th className="border-b p-2">Locatie</th>
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
                                    <td className="border-b p-2">{point.id}</td>
                                    <td className="border-b p-2">{point.location}</td>
                                    <td className="border-b p-2">{point.latitude}</td>
                                    <td className="border-b p-2">{point.longitude}</td>
                                    <td className="border-b p-2">{point.description}</td>
                                    <td className="border-b p-2">{point.images}</td>
                                    <td className="border-b p-2">{point.hints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </RequireRole>
    );
}
