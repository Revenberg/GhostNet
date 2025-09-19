import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function GameRoutePoints() {
    const [points, setPoints] = useState([]);
    const [form, setForm] = useState({
        id: "",
        route_id: "",
        latitude: "",
        longitude: "",
        description: "",
        images: "",
        hints: ""
    });
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        async function fetchAllPoints() {
            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
            try {
                // Haal alle routes op
                const resRoutes = await fetch(`${backendHost}/api/games/routes`);
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
            } catch { }
        }
        fetchAllPoints();
    }, [message]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEdit = point => {
        setEditingId(point.id);
        setForm({ ...point });
    };

    const handleDelete = async id => {
        if (!window.confirm("Weet je zeker dat je dit punt wilt verwijderen?")) return;
        setMessage("...verwijderen");
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(`${backendHost}/api/games/route-points/${id}`, { method: "DELETE" });
        if (res.ok) setMessage("✅ Punt verwijderd");
        else setMessage("❌ Fout bij verwijderen");
        setEditingId(null);
        setForm({ id: "", route_id: "", latitude: "", longitude: "", description: "", images: "", hints: "" });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage("...opslaan");
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `${backendHost}/api/games/route-points/${editingId}` : `${backendHost}/api/games/route-points`;
        const body = { ...form };
        if (!body.latitude || !body.longitude || !body.route_id) return setMessage("route_id, latitude en longitude zijn verplicht");
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (res.ok) setMessage(editingId ? "✅ Punt bijgewerkt" : "✅ Punt toegevoegd");
        else setMessage("❌ Fout bij opslaan");
        setEditingId(null);
        setForm({ id: "", route_id: "", latitude: "", longitude: "", description: "", images: "", hints: "" });
    };

    // Unieke routes extraheren
    const uniqueRoutes = Array.from(new Set(points.map(p => p.route_id)));

    return (
        <RequireRole role="admin">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">Route punten beheren</h2>
                <div className="mb-4">
                    <span className="font-semibold">Routes met punten:</span>
                    <ul className="flex flex-wrap gap-2 mt-1">
                        {uniqueRoutes.map(rid => (
                            <li key={rid} className="bg-gray-100 px-2 py-1 rounded text-xs">Route {rid}</li>
                        ))}
                    </ul>
                </div>
                <form className="space-y-2 mb-6" onSubmit={handleSubmit}>
                    <div className="flex gap-2">
                        <input type="number" name="route_id" placeholder="Route ID" value={form.route_id} onChange={handleChange} className="border px-2 py-1 rounded w-24" required />
                        <input type="number" name="latitude" placeholder="Lat" value={form.latitude} onChange={handleChange} className="border px-2 py-1 rounded w-28" step="any" required />
                        <input type="number" name="longitude" placeholder="Lon" value={form.longitude} onChange={handleChange} className="border px-2 py-1 rounded w-28" step="any" required />
                    </div>
                    <textarea name="description" placeholder="Beschrijving" value={form.description} onChange={handleChange} className="border px-2 py-1 rounded w-full" rows={2} />
                    <input type="text" name="images" placeholder="Afbeeldingen (komma gescheiden)" value={form.images} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
                    <input type="text" name="hints" placeholder="Hints (komma gescheiden)" value={form.hints} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary w-32">{editingId ? "Bijwerken" : "Toevoegen"}</button>
                        {editingId && <button type="button" className="btn-secondary w-32" onClick={() => { setEditingId(null); setForm({ id: "", route_id: "", latitude: "", longitude: "", description: "", images: "", hints: "" }); }}>Annuleren</button>}
                    </div>
                    {message && <div className="text-sm mt-2">{message}</div>}
                </form>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b p-2">Route ID</th>
                            <th className="border-b p-2">Lat</th>
                            <th className="border-b p-2">Lon</th>
                            <th className="border-b p-2">Beschrijving</th>
                            <th className="border-b p-2">Afbeeldingen</th>
                            <th className="border-b p-2">Hints</th>
                            <th className="border-b p-2">Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {points.map(point => (
                            <tr key={point.id}>
                                <td className="border-b p-2">{point.route_id}</td>
                                <td className="border-b p-2">{point.latitude}</td>
                                <td className="border-b p-2">{point.longitude}</td>
                                <td className="border-b p-2">{point.description}</td>
                                <td className="border-b p-2">{point.images}</td>
                                <td className="border-b p-2">{point.hints}</td>
                                <td className="border-b p-2">
                                    <button className="btn-secondary mr-2" onClick={() => handleEdit(point)}>Bewerk</button>
                                    <button className="btn-danger" onClick={() => handleDelete(point.id)}>Verwijder</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </RequireRole>
    );
    
}
