import React, { useState } from "react";
import { getUserFromCookie } from "../../utils/auth";

export default function UpdatePassword() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("...updating");
    try {
      const user = getUserFromCookie();
      if (!user) {
        setMessage("Niet ingelogd");
        setIsSubmitting(false);
        return;
      }
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendHost}/api/users/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          oldPassword: form.oldPassword,
          newPassword: form.newPassword
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Wachtwoord bijgewerkt!");
        setForm({ oldPassword: "", newPassword: "" });
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Serverfout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Wachtwoord bijwerken</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="password"
          name="oldPassword"
          placeholder="Oud wachtwoord"
          value={form.oldPassword}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          name="newPassword"
          placeholder="Nieuw wachtwoord"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
          Bijwerken
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
