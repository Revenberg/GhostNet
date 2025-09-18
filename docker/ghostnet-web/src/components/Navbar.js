import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-purple-700 text-white p-4 flex justify-center space-x-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/about" className="hover:underline">About</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
      <Link to="/login" className="hover:underline">Login</Link>
      <Link to="/register" className="hover:underline">Register</Link>
      <Link to="/users" className="hover:underline">Users</Link>
      <div className="relative group">
        <button className="hover:underline focus:outline-none">Teams ▾</button>
        <div className="absolute left-0 mt-2 w-40 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10">
          <Link to="/teams-overview" className="block px-4 py-2 hover:bg-purple-100">Teams Overview</Link>
          <Link to="/add-team" className="block px-4 py-2 hover:bg-purple-100">Add Team</Link>
          <Link to="/update-team" className="block px-4 py-2 hover:bg-purple-100">Update Team</Link>
          <Link to="/delete-team" className="block px-4 py-2 hover:bg-purple-100">Delete Team</Link>
        </div>
      </div>
    </nav>
  );
}
