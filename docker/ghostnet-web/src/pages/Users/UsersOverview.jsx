import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function UsersOverview() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState({ open: false, id: null, username: "", role: "user" });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, username: "" });
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/users`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  // ...existing code...

  return (
    <RequireRole role="admin">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Gebruikers overzicht</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            {message && <p className="mt-2 text-sm">{message}</p>}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">ID</th>
                  <th className="border-b p-2 text-left">Gebruikersnaam</th>
                  <th className="border-b p-2 text-left">Team</th>
                  <th className="border-b p-2 text-left">Rol</th>
                  <th className="border-b p-2 text-left">Token</th>
                  <th className="border-b p-2 text-left">Acties</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="border-b p-2">{user.id}</td>
                    <td className="border-b p-2">{user.username}</td>
                    <td className="border-b p-2">{user.teamname}</td>
                    <td className="border-b p-2">{user.role}</td>
                    <td className="border-b p-2">{user.token}</td>
                    <td className="border-b p-2">
                      <button className="btn-secondary mr-2" onClick={() => handleEdit(user)}>Bewerken</button>
                      <button className="btn-danger" onClick={() => handleDelete(user)}>Verwijderen</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Edit modal */}
            {editModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-80">
                  <h4 className="font-bold mb-2">Gebruiker bewerken</h4>
                  <form onSubmit={handleEditSubmit}>
                    <label className="block font-medium mb-1">Gebruikersnaam</label>
                    <input
                      type="text"
                      value={editModal.username}
                      onChange={e => setEditModal({ ...editModal, username: e.target.value })}
                      className="w-full border px-3 py-2 rounded mb-2"
                      required
                    />
                    <label className="block font-medium mb-1">Rol</label>
                    <select
                      value={editModal.role}
                      onChange={e => setEditModal({ ...editModal, role: e.target.value })}
                      className="w-full border px-3 py-2 rounded mb-4"
                      required
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <div className="flex justify-end space-x-2">
                      <button type="button" className="btn-secondary" onClick={() => setEditModal({ open: false, id: null, username: "", role: "user" })}>Annuleren</button>
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
                  <h4 className="font-bold mb-2">Gebruiker verwijderen</h4>
                  <p>Weet je zeker dat je gebruiker "{deleteModal.username}" wilt verwijderen?</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button type="button" className="btn-secondary" onClick={() => setDeleteModal({ open: false, id: null, username: "" })}>Annuleren</button>
                    <button type="button" className="btn-danger" onClick={handleDeleteConfirm}>Verwijderen</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RequireRole>
  );
}
