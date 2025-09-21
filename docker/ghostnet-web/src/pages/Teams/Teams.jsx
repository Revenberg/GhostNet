import React, { useState, useEffect } from 'react';
import RequireRole from "../../components/RequireRole";
// Combined Teams page: Overview, Register, Update, Delete
// Assumes API endpoints and logic are similar to the original separate pages

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [form, setForm] = useState({ teamname: '', teamcode: '' });

  // Fetch teams
  return (
    <RequireRole role="admin">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2>Teams</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {loading ? (
          <div>Loading teams...</div>
        ) : (
          <>
            <button onClick={openRegister}>Register New Team</button>
            <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 16 }}>
              <thead>
                <tr>
                  <th>Teamnaam</th>
                  <th>Teamcode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td>{team.teamname}</td>
                    <td>{team.teamcode}</td>
                    <td>
                      <button onClick={() => openUpdate(team)}>Update</button>{' '}
                      <button onClick={() => openDelete(team)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Register Modal */}
        {showRegister && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Register Team</h2>
            <form className="space-y-4 mb-8" onSubmit={handleRegister}>
              <div>
                <label>Teamnaam: </label>
                <input
                  type="text"
                  value={form.teamname}
                  onChange={e => setForm({ ...form, teamname: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Teamcode: </label>
                <input
                  type="text"
                  value={form.teamcode}
                  onChange={e => setForm({ ...form, teamcode: e.target.value })}
                  required
                />
              </div>
              <button type="submit">Register</button>
              <button type="button" onClick={closeModals}>Cancel</button>
            </form>
          </div>
        )}

        {/* Update Modal */}
        {showUpdate && selectedTeam && (
          <div style={modalStyle}>
            <h2>Teamnaam aanpassen</h2>
            <form onSubmit={handleUpdate}>
              <div>
                <label>Teamnaam: </label>
                <input
                  type="text"
                  value={form.teamname}
                  onChange={e => setForm({ ...form, teamname: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Teamcode: </label>
                <input
                  type="text"
                  value={form.teamcode}
                  readOnly
                  style={{ background: '#f3f4f6', color: '#888' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{marginRight: 8}}>Opslaan</button>
              <button type="button" className="btn btn-secondary" onClick={closeModals}>Annuleren</button>
            </form>
          </div>
        )}

        {/* Delete Modal */}
        {showDelete && selectedTeam && (
          <div style={modalStyle}>
            <h2>Team verwijderen</h2>
            <p>Weet je zeker dat je team "{selectedTeam.teamname}" wilt verwijderen?</p>
            <button type="submit" className="btn btn-primary" style={{marginRight: 8}} onClick={() => handleDelete(selectedTeam.id)}>Verwijderen</button>
            <button type="button" className="btn btn-secondary" onClick={closeModals}>Annuleren</button>
          </div>
        )}
      </div>
    </RequireRole>
  );
}

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  border: '1px solid #ccc',
  padding: 24,
  zIndex: 1000,
};

export default Teams;