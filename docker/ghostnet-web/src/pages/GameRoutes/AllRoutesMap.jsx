import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function AllRoutesMap({ gameId }) {
  const [routes, setRoutes] = useState([]);
  const [routePoints, setRoutePoints] = useState({}); // { routeId: [points] }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    async function fetchRoutesAndPoints() {
      const backendHost = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
      // 1. Get all routes for this game
      const res = await fetch(`${backendHost}/api/game_routes?game_id=${gameId}`);
      const data = await res.json();
      if (!res.ok || !data.success) return;
      setRoutes(data.routes);
      // 2. For each route, get points
      const pointsObj = {};
      await Promise.all(
        (data.routes || []).map(async route => {
          const rres = await fetch(`${backendHost}/api/game_routes/route?game_route_id=${route.id}`);
          const rdata = await rres.json();
          if (rres.ok && rdata.success) {
            // Only points with valid lat/lon
            pointsObj[route.id] = (rdata.points || []).filter(p => p.latitude && p.longitude && Number(p.order_id) > 0)
              .sort((a, b) => a.order_id - b.order_id);
          } else {
            pointsObj[route.id] = [];
          }
        })
      );
      setRoutePoints(pointsObj);
      setLoading(false);
    }
    fetchRoutesAndPoints();
  }, [gameId]);

  // Center on first point if available
  let center = [52, 5];
  const allPoints = Object.values(routePoints).flat();
  if (allPoints.length > 0) {
    center = [allPoints[0].latitude, allPoints[0].longitude];
  }

  return (
    <div className="w-full h-[500px]">
      {loading ? (
        <div>Laden...</div>
      ) : (
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {routes.map(route => (
            routePoints[route.id] && routePoints[route.id].length > 1 ? (
              <Polyline
                key={route.id}
                positions={routePoints[route.id].map(p => [p.latitude, p.longitude])}
                color="#0074D9"
              />
            ) : null
          ))}
          {routes.map(route => (
            routePoints[route.id] && routePoints[route.id].map(point => (
              <Marker key={route.id + "-" + point.id} position={[point.latitude, point.longitude]}>
                <Popup>
                  <div>
                    <b>Route:</b> {route.route_name}<br />
                    <b>Punt:</b> {point.location}<br />
                    <b>Beschrijving:</b> {point.description}
                  </div>
                </Popup>
              </Marker>
            ))
          ))}
        </MapContainer>
      )}
    </div>
  );
}
