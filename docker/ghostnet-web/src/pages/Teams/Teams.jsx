import React, { useState, useEffect } from 'react';
import RequireRole from '../../components/RequireRole';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
//  const [showRegister, setShowRegister] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [form, setForm] = useState({ teamname: '', game_id: 0 });
  const [filterGameId, setFilterGameId] = useState('');

  // Fetch teams

  useEffect(() => {
    fetchTeams();
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/games`);
      const data = await res.json();
      if (data.success) {
        setGames(data.games);
      } else {
        setGames([]);
      }
    } catch (err) {
      setGames([]);
    }
  };

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
    const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    try {
      const res = await fetch(`${backendHost}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to register team');
      setForm({ teamname: '', game_id: 0 });
      fetchTeams();
    } catch (err) {
      setError(err.message);
    }
  };

  // Update team
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);


    console.log("Updating team with data:", form);

    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/teams/${selectedTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update team');
      setForm({ teamname: '', game_id: 0 });
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
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/teams/${teamId}`, {
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
/*  const openRegister = () => {
    setForm({ teamname: '', game_id: games.length > 0 ? games[0].id : 0 });
  //  setShowRegister(true);
    setShowUpdate(false);
    setShowDelete(false);
    setSelectedTeam(null);
  };
  */
  const openUpdate = (team) => {
    setForm({
      teamname: team.teamname,
      teamcode: team.teamcode || '',
      game_id: team.game_id || (games.length > 0 ? games[0].id : 0)
    });
    setSelectedTeam(team);
    setShowUpdate(true);
    setShowDelete(false);
  };
  const openDelete = (team) => {
    setSelectedTeam(team);
    setShowDelete(true);
//    setShowRegister(false);
    setShowUpdate(false);
  };
  const closeModals = () => {
    setShowUpdate(false);
    setShowDelete(false);
    setSelectedTeam(null);
    setForm({ teamname: '', game_id: 0 });
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
            <h3 className="text-lg font-semibold mb-2 mt-6">Alle teams</h3>
            <div className="mb-4">
              <label className="mr-2">Filter op game:</label>
              <select
                value={filterGameId}
                onChange={e => setFilterGameId(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">Alle games</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">ID</th>
                  <th className="border-b p-2 text-left">Teamnaam</th>
                  <th className="border-b p-2 text-left">Teamcode</th>
                  <th className="border-b p-2 text-left">Game</th>
                  <th className="border-b p-2 text-left">Acties</th>
                </tr>
              </thead>
              <tbody>
                {teams
                  .filter(team => !filterGameId || String(team.game_id) === String(filterGameId))
                  .map((team) => {
                    const game = games.find(g => g.id === team.game_id);
                    return (
                      <tr key={team.id}>
                        <td className="border-b p-2">{team.id}</td>
                        <td className="border-b p-2">{team.teamname}</td>
                        <td className="border-b p-2">{team.teamcode}</td>
                        <td className="border-b p-2">{game ? game.name : ''}</td>
                        <td className="border-b p-2">
                          <button className="btn-primary mr-2" onClick={() => openUpdate(team)}>Aanpassen</button>
                          <button className="btn-secondary" onClick={() => openDelete(team)}>Verwijderen</button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
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
              <select
                name="game_id"
                value={form.game_id}
                onChange={e => setForm({ ...form, game_id: e.target.value })}
                className="w-full border px-3 py-2 rounded mb-2"
                required
              >
                <option value="" disabled>Kies een game</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Aanmaken</button>
                <button type="button" className="btn-secondary flex-1" onClick={closeModals}>Annuleren</button>
              </div>
            </form>
          </>
        )}

        {/* Update Modal */}
        {showUpdate && selectedTeam && (
          <div style={modalStyle}>
            <h2 className="text-xl font-bold mb-4">Team aanpassen</h2>
            <form onSubmit={handleUpdate} className="space-y-4 mb-4">
              <label htmlFor="teamname" className="block font-medium">Teamnaam</label>
              <input
                id="teamname"
                type="text"
                name="teamname"
                placeholder="Teamnaam"
                value={form.teamname}
                onChange={e => setForm({ ...form, teamname: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <label htmlFor="teamcode" className="block font-medium">Teamcode</label>
              <input
                id="teamcode"
                type="text"
                name="teamcode"
                placeholder="Teamcode"
                value={form.teamcode || ''}
                onChange={e => setForm({ ...form, teamcode: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <select
                name="game_id"
                value={form.game_id}
                onChange={e => setForm({ ...form, game_id: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="" disabled>Kies een game</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
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