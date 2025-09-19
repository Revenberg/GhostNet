import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Speluitleg from "./pages/Speluitleg";
import Contact from "./pages/Contact";

import UsersLogin from "./pages/User/UsersLogin";
import UsersRegister from "./pages/User/UsersRegister";
import UsersOverview from "./pages/User/UsersOverview";
import UsersLogout from "./pages/User/UsersLogout";
import UsersUpdate from "./pages/User/UsersUpdate";

import TeamRegister from "./pages/Team/TeamRegister";
import TeamsUpdate from "./pages/Team/TeamsUpdate";
import TeamDelete from "./pages/Team/TeamDelete";
import TeamsOverview from "./pages/Team/TeamsOverview";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/speluitleg" element={<Speluitleg />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/users-login" element={<UsersLogin />} />
          <Route path="/users-register" element={<UsersRegister />} />
          <Route path="/users-overview" element={<UsersOverview />} />
          <Route path="/add-team" element={<TeamRegister />} />
          <Route path="/update-team" element={<TeamsUpdate />} />
          <Route path="/update-user" element={<UsersUpdate />} />
          <Route path="/delete-team" element={<TeamDelete />} />
          <Route path="/teams-overview" element={<TeamsOverview />} />
          <Route path="/users-logout" element={<UsersLogout />} />
        </Routes>
      </div>
    </div>
  );
}
