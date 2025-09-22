import React from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin, NavbarOperator } from "./Navbars";
import { getUserFromCookie } from "../utils/auth";

export default function Navbar() {
  const user = getUserFromCookie();

  let role = "guest";

  if (user) {
    role = user.role;
  }

  if (role === "admin") return <NavbarAdmin />;
  if (role === "operator") return <NavbarOperator />;
  if (role === "user") return <NavbarUser />;

  return <NavbarGuest />;
}
