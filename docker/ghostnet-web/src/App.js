import UpdatePassword from "./pages/Users/UpdatePassword";
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Speluitleg from "./pages/Speluitleg";
import Contact from "./pages/Contact";

import UsersLogin from "./pages/Users/UsersLogin";
import UsersRegister from "./pages/Users/UsersRegister";
import UsersOverview from "./pages/Users/UsersOverview";
import UsersLogout from "./pages/Users/UsersLogout";
import UsersUpdate from "./pages/Users/UsersUpdate";

import TeamRegister from "./pages/Teams/TeamRegister";
import TeamsUpdate from "./pages/Teams/TeamsUpdate";
import TeamDelete from "./pages/Teams/TeamDelete";
import TeamsOverview from "./pages/Teams/TeamsOverview";
import TeamDetails from "./pages/Team/TeamDetails";
import TeamSendEvent from "./pages/Team/TeamSendEvent";
import GamesCreate from "./pages/Games/GamesCreate";
import GamesUpdate from "./pages/Games/GamesUpdate";
import GamesList from "./pages/Games/GamesList";

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
          <Route path="/users-logout" element={<UsersLogout />} />
          <Route path="/update-user" element={<UsersUpdate />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/add-team" element={<TeamRegister />} />
          <Route path="/update-team" element={<TeamsUpdate />} />
          <Route path="/delete-team" element={<TeamDelete />} />
          <Route path="/teams-overview" element={<TeamsOverview />} />
          <Route path="/team-details/:teamId" element={<TeamDetails />} />
          <Route path="/team-send-event" element={<TeamSendEvent />} />
          <Route path="/games-create" element={<GamesCreate />} />
          <Route path="/games-update" element={<GamesUpdate />} />
          <Route path="/games-list" element={<GamesList />} />
        </Routes>
      </div>
    </div>
  );
}
