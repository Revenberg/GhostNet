import React, { useState } from "react";
import RequireRole from "../../components/RequireRole";

export default function TeamRegister() {
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
				// Create event in frontend (matches working curl)
				const team_id = data.id;
				
				const now = new Date();
				const pad = n => n.toString().padStart(2, '0');
				const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
				const eventMsg = `Team ${form.teamname} aangemaakt op ${dateStr}`;
				await fetch(`${backendHost}/api/games/events/${team_id}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ event_type: "Info", event_message: eventMsg })
				});
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
		<RequireRole role="admin">
			<div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
				<h2 className="text-xl font-bold mb-4">Team registreren</h2>
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
						Team registreren
					</button>
				</form>
				{message && <p className="mt-4 text-sm">{message}</p>}
			</div>
		</RequireRole>
	);
}
