import Logout from "./pages/Logout";
          <Route path="/logout" element={<Logout />} />
import UsersUpdate from "./pages/UsersUpdate";
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Speluitleg from "./pages/Speluitleg";
import Contact from "./pages/Contact";
import UsersLogin from "./pages/UsersLogin";
import UsersRegister from "./pages/UsersRegister";
import UsersOverview from "./pages/UsersOverview";
import TeamRegister from "./pages/TeamRegister";
import TeamsUpdate from "./pages/TeamsUpdate";
import TeamDelete from "./pages/TeamDelete";
import TeamsOverview from "./pages/TeamsOverview";

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
        </Routes>
      </div>
    </div>
  );
}
