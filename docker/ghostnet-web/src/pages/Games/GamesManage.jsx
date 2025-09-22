import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function GamesManage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "" });
  const [message, setMessage] = useState("");
  // removed selectedGameId state (was unused)
  const [editModal, setEditModal] = useState({ open: false, id: null, name: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });

  const fetchGames = async () => {
    setLoading(true);
    setError("");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/games`);
      const data = await res.json();
      if (res.ok && data.success) {
        setGames(data.games);
      } else {
        setError("Fout bij ophalen games");
      }
    } catch (err) {
      setError("Serverfout");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("...verzenden");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (res.ok) {
        setMessage("✅ Game aangemaakt!");
        setForm({ name: "" });
        fetchGames();
      } else {
        setMessage("❌ Fout bij aanmaken");
      }
    } catch (err) {
      setMessage("❌ Serverfout");
    }
  };

  // Edit game name
  const handleEditGame = (game) => {
    setEditModal({ open: true, id: game.id, name: game.name });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMessage("...bijwerken");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/games/${editModal.id}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editModal.name }),
      });
      if (res.ok) {
        setMessage("✅ Naam bijgewerkt!");
        setEditModal({ open: false, id: null, name: "" });
        fetchGames();
      } else {
        setMessage("❌ Fout bij bijwerken");
      }
    } catch (err) {
      setMessage("❌ Serverfout");
    }
  };

  // Delete game
  const handleDeleteGame = (game) => {
    setDeleteModal({ open: true, id: game.id, name: game.name });
  };

  const handleDeleteConfirm = async () => {
    setMessage("...verwijderen");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/games/${deleteModal.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setMessage("✅ Game verwijderd!");
        setDeleteModal({ open: false, id: null, name: "" });
        fetchGames();
      } else {
        setMessage("❌ Fout bij verwijderen");
      }
    } catch (err) {
      setMessage("❌ Serverfout");
    }
  };

  return (
    <RequireRole role="admin">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Games beheren</h2>
        <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Naam"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button type="submit" className="w-full btn-primary">Aanmaken</button>
        </form>
        {message && <p className="mt-2 text-sm">{message}</p>}
        <h3 className="text-lg font-semibold mb-2 mt-6">Alle games</h3>
        {loading ? (
          <p>Laden...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">ID</th>
                <th className="border-b p-2 text-left">Naam</th>
                <th className="border-b p-2 text-left">Status</th>
                <th className="border-b p-2 text-left">Acties</th>
              </tr>
            </thead>
            <tbody>
              {games
                .filter(game => !selectedGameId || String(game.id) === String(selectedGameId))
                .map((game) => (
                  <tr key={game.id}>
                    <td className="border-b p-2">{game.id}</td>
                    <td className="border-b p-2">{game.name}</td>
                    <td className="border-b p-2">{game.status}</td>
                    <td className="border-b p-2">
                      <button className="btn-secondary mr-2" onClick={() => handleEditGame(game)}>Naam wijzigen</button>
                      <button className="btn-danger" onClick={() => handleDeleteGame(game)}>Verwijderen</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* Edit modal */}
        {editModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
              <h4 className="font-bold mb-2">Naam wijzigen</h4>
              <form onSubmit={handleEditSubmit}>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={e => setEditModal({ ...editModal, name: e.target.value })}
                  className="w-full border px-3 py-2 rounded mb-4"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button type="button" className="btn-secondary" onClick={() => setEditModal({ open: false, id: null, name: "" })}>Annuleren</button>
                  <button type="submit" className="btn-primary">Opslaan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete modal */}
        {deleteModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
              <h4 className="font-bold mb-2">Game verwijderen</h4>
              <p>Weet je zeker dat je "{deleteModal.name}" wilt verwijderen?</p>
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setDeleteModal({ open: false, id: null, name: "" })}>Annuleren</button>
                <button type="button" className="btn-danger" onClick={handleDeleteConfirm}>Verwijderen</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
