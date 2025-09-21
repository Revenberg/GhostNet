import React, { useState, useEffect } from 'react';

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
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teams');
      console.log(res);
      
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      console.log(data);
      if (data.success && Array.isArray(data.teams)) {
        console.log(data.teams);
        setTeams(data.teams);
      } else {
        setTeams([]);
        setError('No teams found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register team
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to register team');
      setForm({ teamname: '', teamcode: '' });
      setShowRegister(false);
      fetchTeams();
    } catch (err) {
      setError(err.message);
    }
  };

  // Update team
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update team');
      setForm({ teamname: '', teamcode: '' });
      setShowUpdate(false);
      setSelectedTeam(null);
      fetchTeams();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete team
  const handleDelete = async (teamId) => {
    setError(null);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete team');
      setShowDelete(false);
      setSelectedTeam(null);
      fetchTeams();
    } catch (err) {
      setError(err.message);
    }
  };

  // UI Handlers
  const openRegister = () => {
    setForm({ teamname: '', teamcode: '' });
    setShowRegister(true);
    setShowUpdate(false);
    setShowDelete(false);
    setSelectedTeam(null);
  };
  const openUpdate = (team) => {
    setForm({ teamname: team.teamname, teamcode: team.teamcode });
    setSelectedTeam(team);
    setShowUpdate(true);
    setShowRegister(false);
    setShowDelete(false);
  };
  const openDelete = (team) => {
    setSelectedTeam(team);
    setShowDelete(true);
    setShowRegister(false);
    setShowUpdate(false);
  };
  const closeModals = () => {
    setShowRegister(false);
    setShowUpdate(false);
    setShowDelete(false);
    setSelectedTeam(null);
    setForm({ teamname: '', teamcode: '' });
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>Teams</h1>
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
        <div style={modalStyle}>
          <h2>Register Team</h2>
          <form onSubmit={handleRegister}>
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
          <h2>Update Team</h2>
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
                onChange={e => setForm({ ...form, teamcode: e.target.value })}
                required
              />
            </div>
            <button type="submit">Update</button>
            <button type="button" onClick={closeModals}>Cancel</button>
          </form>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && selectedTeam && (
        <div style={modalStyle}>
          <h2>Delete Team</h2>
          <p>Are you sure you want to delete team "{selectedTeam.teamname}"?</p>
          <button onClick={() => handleDelete(selectedTeam.id)}>Delete</button>
          <button onClick={closeModals}>Cancel</button>
        </div>
      )}
    </div>
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