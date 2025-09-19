import React, { useEffect, useState } from "react";
import { checkUserGranted } from "../utils/auth";

export default function RequireRole({ role, children }) {
  const [granted, setGranted] = useState(null);

  useEffect(() => {
    checkUserGranted(role).then(res => setGranted(res.granted));
  }, [role]);

  if (granted === null) return <div>Checking permissions...</div>;
  if (!granted) return <div className="text-red-600">You are not authorized to view this page.</div>;
  return children;
}
