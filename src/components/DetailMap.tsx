"use client";

import { useEffect, useState } from "react";

interface DetailMapProps {
  lat: number;
  lng: number;
  name: string;
}

export default function DetailMap({ lat, lng, name }: DetailMapProps) {
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [RL, setRL] = useState<typeof import("react-leaflet") | null>(null);

  useEffect(() => {
    Promise.all([import("leaflet"), import("react-leaflet")]).then(
      ([leaflet, reactLeaflet]) => {
        setL(leaflet);
        setRL(reactLeaflet);
      }
    );
  }, []);

  if (!L || !RL) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker } = RL;

  const icon = L.divIcon({
    className: "",
    html: `<div style="
      background: var(--primary);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2.5px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  return (
    <div className="w-full h-48 rounded-xl overflow-hidden border border-[var(--border)]">
      <MapContainer
        center={[lat, lng]}
        zoom={17}
        className="w-full h-full"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
    </div>
  );
}
