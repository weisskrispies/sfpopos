"use client";

import { useState } from "react";
import { Heart, CheckCircle, Clock, MapPin } from "lucide-react";
import { POPOS } from "@/data/popos";
import { getPlaceholderGradient, getTypeEmoji, formatDistance, getDistance } from "@/lib/utils";

interface POPOSCardProps {
  popos: POPOS;
  isSaved: boolean;
  isVisited: boolean;
  onToggleSaved: () => void;
  onToggleVisited: () => void;
  onClick: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function POPOSCard({
  popos,
  isSaved,
  isVisited,
  onToggleSaved,
  onToggleVisited,
  onClick,
  userLocation,
}: POPOSCardProps) {
  const [imgError, setImgError] = useState(false);
  const gradient = getPlaceholderGradient(popos.id);
  const emoji = getTypeEmoji(popos.type);
  const distance = userLocation
    ? getDistance(userLocation.lat, userLocation.lng, popos.lat, popos.lng)
    : null;

  return (
    <div
      className="group cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
        {popos.images[0] && !popos.images[0].includes("placeholder") && !imgError ? (
          <img
            src={popos.images[0]}
            alt={popos.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`absolute inset-0 ${gradient} flex items-center justify-center`}
          >
            <span className="text-5xl opacity-80">{emoji}</span>
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSaved();
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ring-2 ${
              isSaved
                ? "bg-[var(--primary)] text-white ring-white shadow-lg"
                : "bg-white/90 text-[var(--foreground)] hover:bg-white ring-white/50"
            }`}
            title={isSaved ? "Remove from favorites" : "Favorite"}
          >
            <Heart
              className="w-4 h-4"
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisited();
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ring-2 ${
              isVisited
                ? "bg-[var(--secondary)] text-white ring-white shadow-lg"
                : "bg-white/90 text-[var(--foreground)] hover:bg-white ring-white/50"
            }`}
            title={isVisited ? "Mark as not visited" : "Mark as visited"}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Type badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
            {popos.type}
          </span>
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[15px] leading-tight group-hover:text-[var(--primary)] transition-colors">
            {popos.name}
          </h3>
          {distance !== null && (
            <span className="text-xs text-[var(--muted)] whitespace-nowrap mt-0.5">
              {formatDistance(distance)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1 text-[var(--muted)]">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <p className="text-sm truncate">{popos.neighborhood}</p>
        </div>
        <div className="flex items-center gap-1 mt-1 text-[var(--muted)]">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <p className="text-xs truncate">{popos.hours}</p>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {popos.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 bg-gray-100 rounded-full text-[11px] text-[var(--muted)]"
            >
              {f}
            </span>
          ))}
          {popos.features.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[11px] text-[var(--muted)]">
              +{popos.features.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
