"use client";

import { useState } from "react";
import {
  X,
  Heart,
  CheckCircle,
  Clock,
  MapPin,
  Accessibility,
  Train,
  Navigation,
  Share2,
  Compass,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { POPOS } from "@/data/popos";
import {
  getPlaceholderGradient,
  getTypeEmoji,
  formatDistance,
  getDistance,
} from "@/lib/utils";

interface POPOSDetailProps {
  popos: POPOS;
  isSaved: boolean;
  isVisited: boolean;
  onToggleSaved: () => void;
  onToggleVisited: () => void;
  onClose: () => void;
  userLocation?: { lat: number; lng: number } | null;
  onEdit?: () => void;
  isAdmin?: boolean;
}

export default function POPOSDetail({
  popos,
  isSaved,
  isVisited,
  onToggleSaved,
  onToggleVisited,
  onClose,
  userLocation,
  onEdit,
  isAdmin,
}: POPOSDetailProps) {
  const gradient = getPlaceholderGradient(popos.id);
  const emoji = getTypeEmoji(popos.type);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const realImages = popos.images.filter((img) => img && !img.includes("placeholder"));
  const hasMultipleImages = realImages.length >= 2;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? realImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === realImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNextImage();
      else handlePrevImage();
    }
    setTouchStartX(null);
  };

  const distance = userLocation
    ? getDistance(userLocation.lat, userLocation.lng, popos.lat, popos.lng)
    : null;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${popos.lat},${popos.lng}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up sm:animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Admin edit button */}
        {isAdmin && onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-4 left-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Hero with image carousel */}
          <div
            className={`relative w-full aspect-[16/9] ${gradient} flex items-center justify-center`}
            onTouchStart={hasMultipleImages ? handleTouchStart : undefined}
            onTouchEnd={hasMultipleImages ? handleTouchEnd : undefined}
          >
            {realImages.length > 0 ? (
              <img
                src={realImages[currentImageIndex]}
                alt={`${popos.name} - image ${currentImageIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <span className="text-7xl opacity-80">{emoji}</span>
            )}

            {/* Carousel left/right arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {realImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium">
                {popos.type}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Title & actions */}
            <div>
              <h2 className="text-xl font-bold leading-tight">{popos.name}</h2>
              <div className="flex items-center gap-1 mt-1.5 text-[var(--muted)]">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm">{popos.address}</span>
                {distance !== null && (
                  <span className="text-sm ml-2">
                    ({formatDistance(distance)} away)
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {popos.neighborhood}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={onToggleSaved}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isSaved
                    ? "bg-[var(--primary)] text-white"
                    : "border border-[var(--border)] hover:border-gray-400"
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isSaved ? "currentColor" : "none"}
                />
                {isSaved ? "Saved" : "Save"}
              </button>
              <button
                onClick={onToggleVisited}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isVisited
                    ? "bg-[var(--secondary)] text-white"
                    : "border border-[var(--border)] hover:border-gray-400"
                }`}
              >
                <CheckCircle
                  className="w-4 h-4"
                  fill={isVisited ? "currentColor" : "none"}
                />
                {isVisited ? "Visited" : "Mark Visited"}
              </button>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                About
              </h3>
              <p className="text-sm leading-relaxed text-[var(--foreground)]">
                {popos.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Features & Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {popos.features.map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* How to Find It */}
            {popos.howToFind && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  How to Find It
                </h3>
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <Compass className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed text-amber-900">
                    {popos.howToFind}
                  </p>
                </div>
              </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Clock className="w-4 h-4 text-[var(--muted)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Hours
                  </p>
                  <p className="text-sm mt-0.5">{popos.hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Accessibility className="w-4 h-4 text-[var(--muted)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Accessibility
                  </p>
                  <p className="text-sm mt-0.5">{popos.accessibility}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Train className="w-4 h-4 text-[var(--muted)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Transit Nearby
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {popos.transitNearby.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-white border border-[var(--border)] rounded text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Directions */}
            <div className="flex gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--foreground)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
              <button
                onClick={() => {
                  navigator.share?.({
                    title: popos.name,
                    text: `Check out ${popos.name} - a POPOS in San Francisco`,
                    url: directionsUrl,
                  });
                }}
                className="p-3 border border-[var(--border)] rounded-xl hover:border-gray-400 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {popos.yearOpened && (
              <p className="text-xs text-[var(--muted)] text-center pb-2">
                Open since {popos.yearOpened}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
