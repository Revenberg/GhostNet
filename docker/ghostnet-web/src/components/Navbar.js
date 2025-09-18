import React from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin } from "./Navbars";

// Dummy authentication/role logic for demonstration. Replace with real auth logic.
const getUserRole = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  console.log("Navbar - Current user:", user);

  if (!user) return "guest";
  if (user.role === "admin") return "admin";
  return "user";
};

export default function Navbar() {
  const role = getUserRole();
  console.log("Navbar - Current user role:", role);

  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  return <NavbarGuest />;
}
