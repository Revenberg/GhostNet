import React from "react";
import { NavbarGuest, NavbarUser, NavbarAdmin } from "./Navbars";
import { useUserRole } from "../utils/useUserRole";

export default function Navbar() {
  const { role, loading } = useUserRole();

  if (loading) return null;
  if (role === "admin") return <NavbarAdmin />;
  if (role === "user") return <NavbarUser />;
  return <NavbarGuest />;
}

