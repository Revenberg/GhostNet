import React, { useEffect, useState } from "react";

export default function UsersOverview() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(`${backendHost}/api/users`);
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.error || "Unknown error");
        }
      } catch (err) {
        setError("Server error");
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Users Overview</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">ID</th>
              <th className="border-b p-2 text-left">Username</th>
              <th className="border-b p-2 text-left">Team</th>
              <th className="border-b p-2 text-left">Role</th>
              <th className="border-b p-2 text-left">Token</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border-b p-2">{user.id}</td>
                <td className="border-b p-2">{user.username}</td>
                <td className="border-b p-2">{user.teamname}</td>
                <td className="border-b p-2">{user.role}</td>
                <td className="border-b p-2">{user.token}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
