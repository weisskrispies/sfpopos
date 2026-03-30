"use client";

import { useEffect, useState } from "react";
import { POPOS } from "@/data/popos";
import { getTypeEmoji } from "@/lib/utils";

interface MapViewProps {
  spaces: POPOS[];
  saved: Set<string>;
  visited: Set<string>;
  userLocation: { lat: number; lng: number } | null;
  onSelectSpace: (popos: POPOS) => void;
}

export default function MapView({
  spaces,
  saved,
  visited,
  userLocation,
  onSelectSpace,
}: MapViewProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading map...</p>
      </div>
    );
  }

  return <MapInner spaces={spaces} saved={saved} visited={visited} userLocation={userLocation} onSelectSpace={onSelectSpace} />;
}

function MapInner({
  spaces,
  saved,
  visited,
  userLocation,
  onSelectSpace,
}: MapViewProps) {
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
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle } = RL;

  // Always center on downtown SF. Only show user location marker if they're in the SF area.
  const SF_CENTER: [number, number] = [37.7900, -122.3990];
  const isInSFArea =
    userLocation &&
    userLocation.lat > 37.7 &&
    userLocation.lat < 37.82 &&
    userLocation.lng > -122.45 &&
    userLocation.lng < -122.38;
  const center: [number, number] = SF_CENTER;

  const createIcon = (popos: POPOS) => {
    const isSaved = saved.has(popos.id);
    const isVisited = visited.has(popos.id);
    const bg = isVisited
      ? "var(--secondary)"
      : isSaved
        ? "var(--accent)"
        : "var(--primary)";
    const emoji = getTypeEmoji(popos.type);

    return L.divIcon({
      className: "",
      html: `<div style="
        background: ${bg};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2.5px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
      ">${emoji}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20],
    });
  };

  const userIcon = L.divIcon({
    className: "",
    html: `<div style="
      width: 18px;
      height: 18px;
      background: #4285F4;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(66,133,244,0.3), 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* User location - only shown if user is in SF area */}
      {isInSFArea && userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={100}
            pathOptions={{
              color: "#4285F4",
              fillColor: "#4285F4",
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          />
        </>
      )}

      {/* POPOS markers */}
      {spaces.map((popos) => (
        <Marker
          key={popos.id}
          position={[popos.lat, popos.lng]}
          icon={createIcon(popos)}
          eventHandlers={{
            click: () => onSelectSpace(popos),
          }}
        >
          <Popup>
            <div
              className="p-3 cursor-pointer min-w-[180px]"
              onClick={() => onSelectSpace(popos)}
            >
              <p className="font-semibold text-sm">{popos.name}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {popos.type} &middot; {popos.neighborhood}
              </p>
              <p className="text-xs text-[var(--primary)] mt-1 font-medium">
                Tap for details →
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
