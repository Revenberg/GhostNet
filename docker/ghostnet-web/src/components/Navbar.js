import React from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin } from "./Navbars";
import { getUserFromCookie } from "../utils/auth";

export default function Navbar() {
  const user = getUserFromCookie();

  console.log("User from cookie:", user);
  const role = "guest";

  if (!user) {
    role = "guest";
  } else {
    role = user.role;
  }

  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  
  return <NavbarGuest />;
}
