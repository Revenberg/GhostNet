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
      
      <div className="relative group">
        <button className="hover:underline focus:outline-none">{user.username} ▾</button>
        <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/update-password" className="block px-4 py-2 hover:bg-purple-100">Wachtwoord bijwerken</Link>
          <Link to="/users-logout" className="block px-4 py-2 hover:bg-purple-100">Logout</Link>
        </div>
      </div>

    </nav>
  );
}

export function NavbarAdmin() {
  // ...existing code...
  const user = getUserFromCookie();

  return (
    <nav className="bg-purple-700 text-white p-4 flex items-center justify-center space-x-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/speluitleg" className="hover:underline">Speluitleg</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
      <div className="relative group">
        <button className="hover:underline focus:outline-none">Gebruikersbeheer ▾</button>
        <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/users-register" className="block px-4 py-2 hover:bg-purple-100">Register</Link>
          <Link to="/users-overview" className="block px-4 py-2 hover:bg-purple-100">Gebruikers overzicht</Link>
          <Link to="/update-user" className="block px-4 py-2 hover:bg-purple-100">Profiel bijwerken</Link>
        </div>
      </div>

      <div className="relative group">
        <button className="hover:underline focus:outline-none">Teambeheer ▾</button>
        <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/teams-overview" className="block px-4 py-2 hover:bg-purple-100">Teams overzicht</Link>
          <Link to="/add-team" className="block px-4 py-2 hover:bg-purple-100">Team registreren</Link>
          <Link to="/update-team" className="block px-4 py-2 hover:bg-purple-100">Team bijwerken</Link>
          <Link to="/delete-team" className="block px-4 py-2 hover:bg-purple-100">Team verwijderen</Link>
        </div>
      </div>

      <div className="relative group">
        <button className="hover:underline focus:outline-none">Games ▾</button>
        <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/games-list" className="block px-4 py-2 hover:bg-purple-100">Alle games</Link>
          <Link to="/games-create" className="block px-4 py-2 hover:bg-purple-100">Game aanmaken</Link>
          <Link to="/games-update" className="block px-4 py-2 hover:bg-purple-100">Game status bijwerken</Link>
          <Link to="/games-set-status" className="block px-4 py-2 hover:bg-purple-100">Status instellen (per team)</Link>
          <Link to="/games-progress-overview" className="block px-4 py-2 hover:bg-purple-100">Voortgang overzicht</Link>
          <Link to="/games-route-points-maintain" className="block px-4 py-2 hover:bg-purple-100">Route punten beheren</Link>
          <Link to="/games-routes-with-points-maintain" className="block px-4 py-2 hover:bg-purple-100">Routes & punten beheren</Link>
        </div>
      </div>

      <div className="relative group">
        <button className="hover:underline focus:outline-none">Team ▾</button>
        <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to={`/team-details/${user.teamId}`} className="block px-4 py-2 hover:bg-purple-100">{user.teamname}</Link>
          <Link to="/team-send-event" className="block px-4 py-2 hover:bg-purple-100">Stuur bericht</Link>
        </div>
      </div>

      <div className="relative group">
        <button className="hover:underline focus:outline-none">{user.username} ▾</button>
        <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/update-password" className="block px-4 py-2 hover:bg-purple-100">Wachtwoord bijwerken</Link>
          <Link to="/users-logout" className="block px-4 py-2 hover:bg-purple-100">Logout</Link>
        </div>
      </div>

    </nav>
  );
}
