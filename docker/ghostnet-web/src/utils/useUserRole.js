import { useEffect, useState } from "react";
import { checkUserGranted } from "./auth";

export function useUserRole() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserGranted().then(res => {
      setRole(res.role);
      setUser(res.user);
      setLoading(false);
    });
  }, []);

  return { role, user, loading };
}
