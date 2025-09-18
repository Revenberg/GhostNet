import React, { useState } from "react";

export default function AddTeam() {
  const [form, setForm] = useState({ teamname: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("...sending");
    try {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Team added!");
        setForm({ teamname: "" });
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Add Team</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="teamname"
          placeholder="Team Name"
          value={form.teamname}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button type="submit" className="w-full btn-primary">
          Add Team
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
