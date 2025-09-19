import React from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin } from "./Navbars";
import { getUserFromCookie } from "../utils/auth";

export default function Navbar() {
  const user = getUserFromCookie();

  console.log("User from cookie:", user);
  let role = "guest";

  if (user) role = user.role;

  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  
  return <NavbarGuest />;
}
