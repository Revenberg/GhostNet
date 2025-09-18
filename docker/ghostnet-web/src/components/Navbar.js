import React from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin } from "./Navbars";

// Dummy authentication/role logic for demonstration. Replace with real auth logic.
const getUserRole = () => {
  console.log("Navbar - Checking user role...");

  // Read 'user' cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const data = getCookie("user");
  if (!data || data === "undefined") return "guest";

  let user;
  try {
    user = JSON.parse(decodeURIComponent(data));
  } catch (e) {
    console.warn("Navbar - Invalid user data in cookie, treating as guest.", e);
    return "guest";
  }
  if (!user || !user.role) return "guest";
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
