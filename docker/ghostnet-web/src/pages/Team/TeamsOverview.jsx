import React, { useEffect, useState } from "react";
import RequireRole from "../components/RequireRole";

export default function TeamsOverview() {
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function fetchTeams() {
			setLoading(true);
			setError("");
			try {
				const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
				const res = await fetch(`${backendHost}/api/teams`);
				const data = await res.json();
				if (data.success) {
					setTeams(data.teams);
				} else {
					setError(data.error || "Unknown error");
				}
			} catch (err) {
				setError("Server error");
			}
			setLoading(false);
		}
		fetchTeams();
	}, []);

	return (
		<RequireRole role="admin">
			<div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
				<h2 className="text-xl font-bold mb-4">Teams Overview</h2>
				{loading ? (
					<p>Loading...</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : (
					<table className="w-full border-collapse">
						<thead>
							<tr>
								<th className="border-b p-2 text-left">ID</th>
								<th className="border-b p-2 text-left">Team Name</th>
								<th className="border-b p-2 text-left">Team Code</th>
							</tr>
						</thead>
						<tbody>
							{teams.map((team) => (
								<tr key={team.id}>
									<td className="border-b p-2">{team.id}</td>
									<td className="border-b p-2">{team.teamname}</td>
									<td className="border-b p-2">{team.teamcode}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</RequireRole>
	);
}
