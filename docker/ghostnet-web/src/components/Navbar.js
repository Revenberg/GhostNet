import React from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin } from "./Navbars";
import { getUserFromCookie } from "../utils/auth";

export default function Navbar() {
  const user = getUserFromCookie();

  if (!user) return "guest";
  
  const role = user.role;
    
  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  return <NavbarGuest />;
}
