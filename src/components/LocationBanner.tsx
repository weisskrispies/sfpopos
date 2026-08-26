"use client";

import { MapPin, X } from "lucide-react";

interface LocationBannerProps {
  locationEnabled: boolean | null;
  onEnable: () => void;
  onDismiss: () => void;
}

export default function LocationBanner({
  locationEnabled,
  onEnable,
  onDismiss,
}: LocationBannerProps) {
  if (locationEnabled !== null) return null;

  return (
    <div className="bg-green-50 border-b border-green-200 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-[var(--secondary)] shrink-0" />
          <span className="text-gray-700">
            Enable location to sort spaces by distance and see yourself on the map.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEnable}
            className="px-3 py-1 bg-[var(--secondary)] text-white text-xs font-medium rounded-full hover:bg-[var(--secondary-dark,#3d6a0d)] transition-colors"
          >
            Enable
          </button>
          <button
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
