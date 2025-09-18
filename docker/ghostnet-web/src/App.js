import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UsersLogin from "./pages/UsersLogin";
import UsersRegister from "./pages/UsersRegister";
import UsersOverview from "./pages/UsersOverview";
import AddTeam from "./pages/AddTeam";
import UpdateTeam from "./pages/UpdateTeam";
import DeleteTeam from "./pages/DeleteTeam";
import TeamsOverview from "./pages/TeamsOverview";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/users-login" element={<UsersLogin />} />
          <Route path="/users-register" element={<UsersRegister />} />
          <Route path="/users-overview" element={<UsersOverview />} />
          <Route path="/add-team" element={<AddTeam />} />
          <Route path="/update-team" element={<UpdateTeam />} />
          <Route path="/delete-team" element={<DeleteTeam />} />
          <Route path="/teams-overview" element={<TeamsOverview />} />
        </Routes>
      </div>
    </div>
  );
}
