import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove cookies by setting expiry in the past
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Optionally, clear other session data here
    setTimeout(() => {
      navigate("/users-login");
    }, 2000);
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow text-center">
      <h2 className="text-xl font-bold mb-4">Uitloggen...</h2>
      <p>Je wordt afgemeld en teruggestuurd naar de loginpagina.</p>
    </div>
  );
}
