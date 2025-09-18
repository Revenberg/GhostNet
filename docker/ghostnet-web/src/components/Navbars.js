import React from "react";
import { Link } from "react-router-dom";

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
  return (
    <nav className="bg-purple-700 text-white p-4 flex justify-center space-x-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/speluitleg" className="hover:underline">Speluitleg</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
      <Link to="/users-logout" className="hover:underline">Logout</Link>
    </nav>
  );
}

export function NavbarAdmin() {
  return (
    <nav className="bg-purple-700 text-white p-4 flex justify-center space-x-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/speluitleg" className="hover:underline">Speluitleg</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
      <div className="relative group">
        <button className="hover:underline focus:outline-none">Gebruikers ▾</button>
        <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/users-register" className="hover:underline">Register</Link>
          <Link to="/users-overview" className="block px-4 py-2 hover:bg-purple-100">Gebruikers overzicht</Link>
          <Link to="/update-user" className="block px-4 py-2 hover:bg-purple-100">Profiel bijwerken</Link>
        </div>
      </div>
      <div className="relative group">
        <button className="hover:underline focus:outline-none">Teams ▾</button>
        <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/teams-overview" className="block px-4 py-2 hover:bg-purple-100">Teams overzicht</Link>
          <Link to="/add-team" className="block px-4 py-2 hover:bg-purple-100">Team registreren</Link>
          <Link to="/update-team" className="block px-4 py-2 hover:bg-purple-100">Team bijwerken</Link>
          <Link to="/delete-team" className="block px-4 py-2 hover:bg-purple-100">Team verwijderen</Link>
        </div>
      </div>
      <Link to="/users-logout" className="hover:underline">Logout</Link>
    </nav>
  );
}
