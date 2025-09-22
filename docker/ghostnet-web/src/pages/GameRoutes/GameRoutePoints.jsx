import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function GameRoutePoints() {
    const [games, setGames] = useState([]);
    const [selectedGameId, setSelectedGameId] = useState(() => {
        return localStorage.getItem("selectedGameId") || "";
    });
    const [points, setPoints] = useState([]);
    const [form, setForm] = useState({
        id: "",
        latitude: "",
        longitude: "",
        location: "",
        description: "",
        images: "",
        hints: ""
    });
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);

    // Fetch games for selection
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

    // Fetch points for selected game
    useEffect(() => {
        if (!selectedGameId) return setPoints([]);
        async function fetchPoints() {
            const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
            try {
                const res = await fetch(`${backendHost}/api/game_routes/points/by-game/${selectedGameId}`);
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.error || "Fout bij laden");
                setPoints(data.points);
            } catch {
                setPoints([]);
            }
        }
        fetchPoints();
    }, [selectedGameId, message]);

    // Persist selected game
    useEffect(() => {
        if (selectedGameId) {
            localStorage.setItem("selectedGameId", selectedGameId);
        }
    }, [selectedGameId]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEdit = point => {
        setEditingId(point.id);
        // route_id niet meer in formulier
        const { route_id, ...rest } = point;
        setForm({
            ...rest,
            location: point.location || point.route_location || ""
        });
    };

    const handleDelete = async id => {
        if (!window.confirm("Weet je zeker dat je dit punt wilt verwijderen?")) return;
        setMessage("...verwijderen");
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(`${backendHost}/api/game_routes/points/${id}`, { method: "DELETE" });
        if (res.ok) setMessage("✅ Punt verwijderd");
        else setMessage("❌ Fout bij verwijderen");
        setEditingId(null);
        setForm({ id: "", latitude: "", longitude: "", location: "", description: "", images: "", hints: "" });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage("...opslaan");
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `${backendHost}/api/game_routes/points/${editingId}` : `${backendHost}/api/game_routes/points`;
        const body = { ...form, game_id: selectedGameId };

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (res.ok) setMessage(editingId ? "✅ Punt bijgewerkt" : "✅ Punt toegevoegd");
        else setMessage("❌ Fout bij opslaan");
        setEditingId(null);
        setForm({ id: "", latitude: "", longitude: "", location: "", description: "", images: "", hints: "" });
    };

    return (
        <RequireRole role="admin">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">Route punten beheren</h2>
                <div className="mb-4">
                    <label className="font-semibold mr-2">Selecteer game:</label>
                    <select
                        className="border px-2 py-1 rounded"
                        value={selectedGameId}
                        onChange={e => setSelectedGameId(e.target.value)}
                    >
                        <option value="">-- Kies een game --</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.id} - {game.name}</option>
                        ))}
                    </select>
                </div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b p-2">Locatie</th>
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
                                <td className="border-b p-2">{point.location || point.route_location || ""}</td>
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
                {selectedGameId && (
                    <form className="space-y-2 mb-6" onSubmit={handleSubmit}>
                        <h2 className="text-lg font-bold mt-6">{editingId ? "Punt bewerken" : "Nieuw punt toevoegen"}</h2>
                        <div className="flex gap-2">
                            <input type="text" name="location" placeholder="Locatie" value={form.location} onChange={handleChange} className="border px-2 py-1 rounded w-40" required />
                        </div>
                        <div className="flex gap-2">
                            <input type="number" name="latitude" placeholder="Lat" value={form.latitude} onChange={handleChange} className="border px-2 py-1 rounded w-28" step="any" />
                            <input type="number" name="longitude" placeholder="Lon" value={form.longitude} onChange={handleChange} className="border px-2 py-1 rounded w-28" step="any" />
                        </div>
                        <textarea name="description" placeholder="Beschrijving" value={form.description} onChange={handleChange} className="border px-2 py-1 rounded w-full" rows={2} />
                        <input type="text" name="images" placeholder="Afbeeldingen (komma gescheiden)" value={form.images} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
                        <input type="text" name="hints" placeholder="Hints (komma gescheiden)" value={form.hints} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
                        <div className="flex gap-2">
                            <button type="submit" className="btn-primary w-32">{editingId ? "Bijwerken" : "Toevoegen"}</button>
                            {editingId && <button type="button" className="btn-secondary w-32" onClick={() => { setEditingId(null); setForm({ id: "", latitude: "", longitude: "", location: "", description: "", images: "", hints: "" }); }}>Annuleren</button>}
                        </div>
                        {message && <div className="text-sm mt-2">{message}</div>}
                    </form>
                )}
            </div>
        </RequireRole>
    );

}