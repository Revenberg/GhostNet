// Utility to check if user is granted for a page
// Usage: import { checkUserGranted } from "../utils/auth";
// Returns: { granted: boolean, user: object|null, role: string|null }

export function getUserFromCookie() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; user=`);
  if (parts.length !== 2) return null;
  return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
}

export async function checkUserGranted(requiredRole = null) {
  const user = getUserFromCookie();  
  if (!user) return {granted: false, username: null, role: null};

  let role = user.role;
  let granted = false;
    
  if (role === "admin") granted = true;
  if (role === requiredRole) granted = true;

  return {granted: granted, username: user.username, role: user.role};
}
