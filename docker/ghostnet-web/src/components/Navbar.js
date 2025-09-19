import React, { useEffect, useState } from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin } from "./Navbars";

function getTokenFromCookie() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length !== 2) return null;
  return parts.pop().split(';').shift();
}

function getUserFromCookie() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; user=`);
  if (parts.length !== 2) return null;
  return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
}


export default function Navbar() {
  const user = getUserFromCookie();

  if (!user) return role = "guest";

  console.log("User from cookie:", user);
  
  const role = user.role;
  console.log("User role from cookie:", role);
    
  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  return <NavbarGuest />;
}
