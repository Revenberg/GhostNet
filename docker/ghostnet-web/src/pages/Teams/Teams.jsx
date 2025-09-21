import React, { useState, useEffect } from 'react';
import RequireRole from '../../components/RequireRole';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [form, setForm] = useState({ teamname: '' });

  // Fetch teams
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        const [teamsRes] = await Promise.all([
            fetch(`${backendHost}/api/teams`),
        ]);
        const teamsData = await teamsRes.json();

        console.log("Fetched teams data:", teamsData);

    if (teamsData.success) {
        setTeams(teamsData.teams);
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
      setForm({ teamname: '' });
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
      setForm({ teamname: '' });
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
    setForm({ teamname: '' });
    setShowRegister(true);
    setShowUpdate(false);
    setShowDelete(false);
    setSelectedTeam(null);
  };
  const openUpdate = (team) => {
    setForm({ teamname: team.teamname });
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
    setForm({ teamname: '' });
  };


  return (
    <RequireRole role="admin">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">Teams beheren</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Laden...</div>
        ) : (
          <>
            <form className="space-y-4 mb-8" onSubmit={handleRegister}>
              <input
                type="text"
                name="teamname"
                placeholder="Teamnaam"
                value={form.teamname}
                onChange={e => setForm({ ...form, teamname: e.target.value })}
                className="w-full border px-3 py-2 rounded mb-2"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Aanmaken</button>
                <button type="button" className="btn-secondary flex-1" onClick={closeModals}>Annuleren</button>
              </div>
            </form>
            <h3 className="text-lg font-semibold mb-2 mt-6">Alle teams</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">ID</th>
                  <th className="border-b p-2 text-left">Teamnaam</th>
                  <th className="border-b p-2 text-left">Teamcode</th>
                  <th className="border-b p-2 text-left">Acties</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td className="border-b p-2">{team.id}</td>
                    <td className="border-b p-2">{team.teamname}</td>
                    <td className="border-b p-2">{team.teamcode}</td>
                    <td className="border-b p-2">
                      <button className="btn-primary mr-2" onClick={() => openUpdate(team)}>Aanpassen</button>
                      <button className="btn-secondary" onClick={() => openDelete(team)}>Verwijderen</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Update Modal */}
        {showUpdate && selectedTeam && (
          <div style={modalStyle}>
            <h2 className="text-xl font-bold mb-4">Teamnaam aanpassen</h2>
            <form onSubmit={handleUpdate} className="space-y-4 mb-4">
              <input
                type="text"
                name="teamname"
                placeholder="Teamnaam"
                value={form.teamname}
                onChange={e => setForm({ ...form, teamname: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="text"
                name="teamcode"
                value={form.teamcode}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-400"
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Opslaan</button>
                <button type="button" className="btn-secondary flex-1" onClick={closeModals}>Annuleren</button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Modal */}
        {showDelete && selectedTeam && (
          <div style={modalStyle}>
            <h2 className="text-xl font-bold mb-4">Team verwijderen</h2>
            <p>Weet je zeker dat je team "{selectedTeam.teamname}" wilt verwijderen?</p>
            <div className="flex gap-2 mt-4">
              <button className="btn-primary flex-1" onClick={() => handleDelete(selectedTeam.id)}>Verwijderen</button>
              <button className="btn-secondary flex-1" onClick={closeModals}>Annuleren</button>
            </div>
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