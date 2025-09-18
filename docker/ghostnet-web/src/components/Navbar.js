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

  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length !== 2) return "guest";

  const token = parts.pop().split(';').shift();

  console.log("Navbar - Retrieved token from cookie:", token);

  const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
  const res = fetch(`${backendHost}/api/users/by-token/${encodeURIComponent(token)}`);
  
  if (!res.ok) throw new Error("User not found");

  const userData = res.json();

  if (!userData || userData === "undefined") return "guest";

  const user = userData.user;
  console.log("Navbar - User data from cookie:", user);
  console.log("Navbar - User data from cookie:", userData);

  let parsedUser;
  try {
    parsedUser = JSON.parse(decodeURIComponent(userData));
    console.log("Navbar - Parsed user data:", parsedUser);
  } catch (e) {
    console.warn("Navbar - Invalid user data in cookie, treating as guest.", e);
    return "guest";
  }

  console.log("Navbar - User role:", parsedUser.role);
  if (!parsedUser.role) return "guest";

  if (parsedUser.name === "admin") parsedUser.role = "admin";
  
  console.log("Navbar - Detected user role:", parsedUser.role);
  
  return parsedUser.role;
};

export default function Navbar() {
  const role = getUserRole();
  console.log("Navbar - Current user role:", role);

  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  return <NavbarGuest />;
}
