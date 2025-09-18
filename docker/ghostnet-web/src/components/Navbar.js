import React from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin } from "./Navbars";

// Read 'user' cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  
  console.log("Navbar - Current cookies:", document.cookie);

  const parts = value.split(`; ${name}=`);
  console.log(`Navbar - Cookie parts for ${name}:`, parts);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const getUserRole = () => {
  console.log("Navbar - Checking user role...");

  const data = getCookie("user");
  if (!data || data === "undefined") return "guest";

  console.log("Navbar - User data from cookie:", data);

  let user;
  try {
    user = JSON.parse(decodeURIComponent(data));
    console.log("Navbar - Parsed user data:", user);
  } catch (e) {
    console.warn("Navbar - Invalid user data in cookie, treating as guest.", e);
    return "guest";
  }

  console.log("Navbar - User role:", user.role);
  if (!user.role) return "guest";

  if (user.name === "admin") user.role = "admin";
  
  console.log("Navbar - Detected user role:", user.role);
  
  return user.role;
};

export default function Navbar() {
  const role = getUserRole();
  console.log("Navbar - Current user role:", role);

  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  return <NavbarGuest />;
}
