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
      <Link to="/users-overview" className="hover:underline">Mijn Profiel</Link>
      <Link to="/update-user" className="hover:underline">Profiel bijwerken</Link>
      <Link to="/teams-overview" className="hover:underline">Teams</Link>
      <Link to="/add-team" className="hover:underline">Team registreren</Link>
      <Link to="/update-team" className="hover:underline">Team bijwerken</Link>
      <Link to="/delete-team" className="hover:underline">Team verwijderen</Link>
      <Link to="/users-login" className="hover:underline">Logout</Link>
    </nav>
  );
}

export function NavbarAdmin() {
  return (
    <nav className="bg-purple-700 text-white p-4 flex justify-center space-x-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/speluitleg" className="hover:underline">Speluitleg</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
      <Link to="/users-overview" className="hover:underline">Gebruikers</Link>
      <Link to="/update-user" className="hover:underline">Profiel bijwerken</Link>
      <Link to="/teams-overview" className="hover:underline">Teams</Link>
      <Link to="/add-team" className="hover:underline">Team registreren</Link>
      <Link to="/update-team" className="hover:underline">Team bijwerken</Link>
      <Link to="/delete-team" className="hover:underline">Team verwijderen</Link>
      <Link to="/users-login" className="hover:underline">Logout</Link>
    </nav>
  );
}
