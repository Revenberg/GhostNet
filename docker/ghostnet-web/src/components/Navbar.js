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
  const [role, setRole] = useState("guest");

  useEffect(() => {
    const user = getUserFromCookie();
    console.log("User from cookie:", user);
    console.log("User from cookie:", user.role);
    
    const token = getTokenFromCookie();
    console.log("Token from cookie:", token);

    if (!token) return setRole("guest");

    const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    fetch(`${backendHost}/api/users/by-token/${token}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        
        console.log("User data from token:", data);

        if (data && data.user && data.user.role) {
          console.log("User role from backend:", data.user.role);
          setRole(data.user.username === "admin" ? "admin" : "user");
        } else {
          setRole("guest");
        }
      })
      .catch(() => setRole("guest"));
  }, []);

  console.log("Current role:", role);
  
  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  return <NavbarGuest />;
}
