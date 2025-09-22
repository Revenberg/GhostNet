import React from "react";
import { Link } from "react-router-dom";
import { getUserFromCookie } from "../utils/auth";

export function NavbarGuest() {
  return (
    <nav className="bg-purple-700 text-white p-4 flex justify-center space-x-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/speluitleg" className="hover:underline">Speluitleg</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
      <Link to="/users-login" className="hover:underline">Login</Link>
      <Link to="/users-register" className="hover:underline">Register</Link>
    </nav>
  );
}

export function NavbarUser() {
  const user = getUserFromCookie();
  const [teamDropdownOpen, setTeamDropdownOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  return (
    <nav className="bg-purple-700 text-white p-4 flex items-center justify-center space-x-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/speluitleg" className="hover:underline">Speluitleg</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
      <div className="relative">
        <button
          className="hover:underline focus:outline-none"
          onClick={() => setTeamDropdownOpen((open) => !open)}
        >
          {user.teamname} ▾
        </button>
        {teamDropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
            <Link to={`/team-details/${user.teamId}`} className="block px-4 py-2 hover:bg-purple-100">Mijn Team</Link>
            <Link to="/team-send-event" className="block px-4 py-2 hover:bg-purple-100">Stuur bericht</Link>
          </div>
        )}
      </div>
      <div className="relative">
        <button
          className="hover:underline focus:outline-none"
          onClick={() => setUserDropdownOpen((open) => !open)}
        >
          {user.username} ▾
        </button>
        {userDropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
            <Link to="/update-password" className="block px-4 py-2 hover:bg-purple-100">Wachtwoord bijwerken</Link>
            <Link to="/users-logout" className="block px-4 py-2 hover:bg-purple-100">Logout</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export function NavbarOperator() {
  const user = getUserFromCookie();
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  return (
    <nav className="bg-purple-700 text-white p-4 flex items-center justify-center space-x-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/speluitleg" className="hover:underline">Speluitleg</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
      <div className="relative group">
        <button className="hover:underline focus:outline-none">{user.teamname} ▾</button>
        <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to={`/team-details/${user.teamId}`} className="block px-4 py-2 hover:bg-purple-100">Mijn Team</Link>
          <Link to="/team-send-event" className="block px-4 py-2 hover:bg-purple-100">Stuur bericht</Link>
        </div>
      </div>
      
      <div className="relative">
        <button
          className="hover:underline focus:outline-none"
          onClick={() => setUserDropdownOpen((open) => !open)}
        >
          {user.username} ▾
        </button>
        {userDropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
            <Link to="/update-password" className="block px-4 py-2 hover:bg-purple-100">Wachtwoord bijwerken</Link>
            <Link to="/users-logout" className="block px-4 py-2 hover:bg-purple-100">Logout</Link>
          </div>
        )}
      </div>

      <div className="relative group">
        <button className="hover:underline focus:outline-none">Games voorbereiding ▾</button>
        <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/games/all-routes-map" className="block px-4 py-2 hover:bg-purple-100">Kaart: alle routes</Link>
        </div>
      </div>

      <div className="relative group">
        <button className="hover:underline focus:outline-none">Games ▾</button>
        <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/games-update" className="block px-4 py-2 hover:bg-purple-100">Game status bijwerken</Link>
          <Link to="/games-set-status" className="block px-4 py-2 hover:bg-purple-100">Status instellen (per team)</Link>
          <Link to="/games-progress-overview" className="block px-4 py-2 hover:bg-purple-100">Voortgang overzicht</Link>
        </div>
      </div>

    </nav>
  );
}

export function NavbarAdmin() {
  const user = getUserFromCookie();

  const [userMgmtDropdownOpen, setUserMgmtDropdownOpen] = React.useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = React.useState(false);
  const [beheerDropdownOpen, setBeheerDropdownOpen] = React.useState(false);
  const [gamesVoorDropdownOpen, setGamesVoorDropdownOpen] = React.useState(false);
  const [gamesDropdownOpen, setGamesDropdownOpen] = React.useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  // Helper to close all dropdowns
  const closeAllDropdowns = () => {
    setUserMgmtDropdownOpen(false);
    setOrgDropdownOpen(false);
    setBeheerDropdownOpen(false);
    setGamesVoorDropdownOpen(false);
    setGamesDropdownOpen(false);
    setTeamDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  // Auto-close timer refs
  const timers = React.useRef({});

  // Set auto-close for a dropdown
  const setDropdownWithTimeout = (setter, key) => {
    setter(true);
    if (timers.current[key]) clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => setter(false), 15000);
  };

  // Clear all timers on unmount (fix React warning)
  React.useEffect(() => {
    const timersCopy = timers.current;
    return () => {
      Object.values(timersCopy).forEach(clearTimeout);
    };
  }, []);

  return (
    <nav
      className="bg-purple-700 text-white p-4 flex items-center justify-center space-x-6"
      onClick={closeAllDropdowns}
    >
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/speluitleg" className="hover:underline">Speluitleg</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          className="hover:underline focus:outline-none"
          onClick={() => setDropdownWithTimeout(setUserMgmtDropdownOpen, 'userMgmt')}
        >
          Gebruikersbeheer ▾
        </button>
        {userMgmtDropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
            <Link to="/users-register" className="block px-4 py-2 hover:bg-purple-100">Register</Link>
            <Link to="/update-user" className="block px-4 py-2 hover:bg-purple-100">Profiel bijwerken</Link>
          </div>
        )}
      </div>

      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          className="hover:underline focus:outline-none"
          onClick={() => setDropdownWithTimeout(setOrgDropdownOpen, 'org')}
        >
          Organisatie ▾
        </button>
        {orgDropdownOpen && (
          <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded shadow-lg z-10">
            <Link to="/users-overview" className="block px-4 py-2 hover:bg-purple-100">Gebruikers overzicht</Link>
            <Link to="/teams" className="block px-4 py-2 hover:bg-purple-100">Teams beheer</Link>
            <div className="border-t my-1"></div>
            <div className="relative">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-purple-100 focus:outline-none"
                onClick={e => { e.stopPropagation(); setDropdownWithTimeout(setBeheerDropdownOpen, 'beheer'); }}
              >
                Beheer ▾
              </button>
              {beheerDropdownOpen && (
                <div className="absolute left-full top-0 mt-0 w-56 bg-white text-black rounded shadow-lg z-20">
                  <Link to="/games-manage" className="block px-4 py-2 hover:bg-purple-100">Games beheren</Link>
                  <Link to="/games-route-points" className="block px-4 py-2 hover:bg-purple-100">Route punten beheren</Link>
                  <Link to="/games/create-route" className="block px-4 py-2 hover:bg-purple-100">Route aanmaken/beheren</Link>
                  <Link to="/games/route-teams" className="block px-4 py-2 hover:bg-purple-100">Teams per route</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          className="hover:underline focus:outline-none"
          onClick={() => setDropdownWithTimeout(setGamesVoorDropdownOpen, 'gamesVoor')}
        >
          Games voorbereiding ▾
        </button>
        {gamesVoorDropdownOpen && (
          <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded shadow-lg z-10">
            <Link to="/games/all-routes-map" className="block px-4 py-2 hover:bg-purple-100">Kaart: alle routes</Link>
          </div>
        )}
      </div>

      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          className="hover:underline focus:outline-none"
          onClick={() => setDropdownWithTimeout(setGamesDropdownOpen, 'games')}
        >
          Games ▾
        </button>
        {gamesDropdownOpen && (
          <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded shadow-lg z-10">
            <Link to="/games-update" className="block px-4 py-2 hover:bg-purple-100">Game status bijwerken</Link>
            <Link to="/games-set-status" className="block px-4 py-2 hover:bg-purple-100">Status instellen (per team)</Link>
            <Link to="/games-progress-overview" className="block px-4 py-2 hover:bg-purple-100">Voortgang overzicht</Link>
          </div>
        )}
      </div>

      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          className="hover:underline focus:outline-none"
          onClick={() => setDropdownWithTimeout(setTeamDropdownOpen, 'team')}
        >
          Team ▾
        </button>
        {teamDropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
            <Link to={`/team-details/${user.teamId}`} className="block px-4 py-2 hover:bg-purple-100">{user.teamname}</Link>
            <Link to="/team-send-event" className="block px-4 py-2 hover:bg-purple-100">Stuur bericht</Link>
          </div>
        )}
      </div>

      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          className="hover:underline focus:outline-none"
          onClick={() => setDropdownWithTimeout(setUserDropdownOpen, 'user')}
        >
          {user.username} ▾
        </button>
        {userDropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
            <Link to="/update-password" className="block px-4 py-2 hover:bg-purple-100">Wachtwoord bijwerken</Link>
            <Link to="/users-logout" className="block px-4 py-2 hover:bg-purple-100">Logout</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
