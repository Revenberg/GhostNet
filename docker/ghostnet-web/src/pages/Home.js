import React from "react";

export default function Home() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-5xl font-bold mb-4 text-purple-700">👻 GhostNet.web</h1>
      <h2 className="text-2xl font-semibold mb-4">The real-life off grid game</h2>
      <p className="text-lg mb-4">Bezoek alle locaties in de juiste volgorde.<br />Wie dat als eerste lukt, wint!</p>
      <div className="bg-purple-50 rounded-xl p-4 mb-4 inline-block">
        <p className="text-md mb-2">💬 Chat met andere teams via het ghost-netwerk en probeer ze een geheim woord te laten zeggen. Scoor zo bonuspunten!</p>
      </div>
      <p className="text-lg font-medium mt-6">⚡ Avontuur. Strategie. Teamwork. Snelheid</p>
    </div>
  );
}
