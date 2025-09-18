import React from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin } from "./Navbars";

// Dummy authentication/role logic for demonstration. Replace with real auth logic.
const getUserRole = () => {
  // Example: return "guest" | "user" | "admin"
  // Replace with actual authentication/role logic
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return "guest";
  if (user.role === "admin") return "admin";
  return "user";
};

export default function Navbar() {
  const role = getUserRole();
  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  return <NavbarGuest />;
}
