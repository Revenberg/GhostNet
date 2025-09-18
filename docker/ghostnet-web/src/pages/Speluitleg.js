import React from "react";

export default function Speluitleg() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold mb-4 text-purple-700">👻 Durf jij de jacht te starten in het verborgen netwerk?</h1>
      <p className="text-lg mb-6">Welkom bij Ghostweb – het real-life off grid game waar jij en je teamleden op zoek gaan naar geheime hotspots. Geen internet, geen standaard communicatie: alles loopt via ons eigen ghost-netwerk.</p>

      <h2 className="text-2xl font-semibold mb-2 mt-8">🎯 De missie</h2>
      <p className="mb-4">Bezoek alle locaties in de juiste volgorde.<br />Wie dat als eerste lukt, wint het spel!</p>

      <h2 className="text-2xl font-semibold mb-2 mt-8">💬 Ghost Chat</h2>
      <p className="mb-4">Op elke plek kun je chatten met andere teams via het verborgen netwerk. Maar er is meer: je krijgt ook een geheime opdracht. Probeer de ander een bepaald woord te laten zeggen.<br />
      <span className="font-medium">👉 Lukt dat? Dan scoor je een bonuspunt voor je team.</span></p>

      <h2 className="text-2xl font-semibold mb-2 mt-8">⚡ Waarom Ghostweb?</h2>
      <ul className="list-disc list-inside text-left max-w-xl mx-auto mb-6">
        <li>Real-life avontuur</li>
        <li>Off grid, maar toch met je telefoon</li>
        <li>Slimme strategie + snelheid</li>
        <li>Teamwork én mind games</li>
      </ul>

      <p className="text-lg font-medium mt-6">Ben jij slim genoeg om de aanwijzingen te volgen, sneaky genoeg om extra punten te pakken en snel genoeg om als eerste te finishen?</p>
    </div>
  );
}
