import React from "react";
import UpdatePassword from "./pages/Users/UpdatePassword";
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

import Teams from "./pages/Teams/Teams";
import TeamDetails from "./pages/Team/TeamDetails";
import TeamSendEvent from "./pages/Team/TeamSendEvent";
import GamesUpdate from "./pages/Games/GamesUpdate";
import GamesSetStatus from "./pages/Games/GamesSetStatus";
import GamesProgressOverview from "./pages/Games/GamesProgressOverview";
import GamesManage from "./pages/Games/GamesManage";
import GameRoutePoints from './pages/GameRoutes/GameRoutePoints';
import CreateRoutePage from './pages/GameRoutes/CreateRoutePage';
import AllRoutesMap from './pages/GameRoutes/AllRoutesMap';
import RouteTeamsPage from './pages/GameRoutes/RouteTeamsPage';
import TeamRankingSummary from './pages/Team/team-ranking-summary';

import GameEngine from "./pages/GameEngine/GameEngine";
import RankingSummary from "./pages/GameEngine/ranking_summary";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <Routes>
            <>
              <Route path="/" element={<Home />} />
              <Route path="/speluitleg" element={<Speluitleg />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/users-login" element={<UsersLogin />} />
              <Route path="/users-register" element={<UsersRegister />} />
              <Route path="/users-overview" element={<UsersOverview />} />
              <Route path="/users-logout" element={<UsersLogout />} />
              <Route path="/update-user" element={<UsersUpdate />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/team-details/:teamId" element={<TeamDetails />} />
              <Route path="/team-send-event" element={<TeamSendEvent />} />
              <Route path="/team-ranking-summary" element={<TeamRankingSummary />} />
              <Route path="/games-manage" element={<GamesManage />} />
              <Route path="/games-update" element={<GamesUpdate />} />
              <Route path="/games-progress-overview" element={<GamesProgressOverview />} />
              <Route path="/games-set-status" element={<GamesSetStatus />} />
              <Route path="/games-route-points" element={<GameRoutePoints />} />
              <Route path="/games/create-route" element={<CreateRoutePage />} />
              <Route path="/games/all-routes-map" element={<AllRoutesMap />} />
              <Route path="/games/route-teams" element={<RouteTeamsPage />} />
              <Route path="/game-engine" element={<GameEngine />} />
              <Route path="/ranking-summary" element={<RankingSummary />} />
            </>
        </Routes>
      </div>
    </div>
  );
}
