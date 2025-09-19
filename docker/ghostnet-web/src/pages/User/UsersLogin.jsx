import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UsersLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("...checking");

    try {
      // Use the docker-compose service name as the backend host
      // If running in Docker, use "backend" as the hostname (see docker-compose.yml)
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      // Try to get Set-Cookie header (note: not accessible in browsers due to CORS, but credentials: 'include' will store it if backend sets it)
      const data = await res.json();

      console.log("Login response:", res);
      console.log("Login data:", data); 

      if (res.ok) {
        setMessage("✅ Login successful! Je wordt doorgestuurd...");

        document.cookie = `token=${encodeURIComponent(data.user.token)}; Path=/; Max-Age=604800`;
        document.cookie = `username=${encodeURIComponent(JSON.stringify(data.user.username))}; Path=/; Max-Age=604800`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; Path=/; Max-Age=604800`;

        setTimeout(() => {
          navigate("/");
          setTimeout(() => {
            window.location.reload(); // Force navbar and app state to refresh
          }, 100);
        }, 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button type="submit" className="w-full btn-primary">
          Sign In
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
