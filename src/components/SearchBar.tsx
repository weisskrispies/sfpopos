"use client";

import { Search, SlidersHorizontal, X, Heart, CheckCircle } from "lucide-react";
import { neighborhoods, types } from "@/data/popos";
import { useState } from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedType: string | null;
  onTypeChange: (t: string | null) => void;
  selectedNeighborhood: string | null;
  onNeighborhoodChange: (n: string | null) => void;
  showSavedOnly: boolean;
  onShowSavedOnly: (v: boolean) => void;
  showVisitedOnly: boolean;
  onShowVisitedOnly: (v: boolean) => void;
  resultCount: number;
}

export default function SearchBar({
  query,
  onQueryChange,
  selectedType,
  onTypeChange,
  selectedNeighborhood,
  onNeighborhoodChange,
  showSavedOnly,
  onShowSavedOnly,
  showVisitedOnly,
  onShowVisitedOnly,
  resultCount,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasFilters = selectedType || selectedNeighborhood || showSavedOnly || showVisitedOnly;

  return (
    <div className="bg-white border-b border-[var(--border)] sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search spaces, neighborhoods, features..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-[var(--border)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-full text-sm font-medium transition-all ${
              hasFilters
                ? "border-[var(--primary)] text-[var(--primary)] bg-red-50"
                : "border-[var(--border)] hover:border-gray-400"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="w-2 h-2 bg-[var(--primary)] rounded-full" />
            )}
          </button>
        </div>

        {/* Filter Pills */}
        {showFilters && (
          <div className="mt-3 animate-fade-in space-y-3">
            {/* Type chips */}
            <div>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                Type
              </p>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                  <button
                    key={t}
                    onClick={() => onTypeChange(selectedType === t ? null : t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedType === t
                        ? "bg-[var(--foreground)] text-white border-[var(--foreground)]"
                        : "border-[var(--border)] hover:border-gray-400 text-[var(--muted)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Neighborhood chips */}
            <div>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                Neighborhood
              </p>
              <div className="flex flex-wrap gap-2">
                {neighborhoods.map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      onNeighborhoodChange(selectedNeighborhood === n ? null : n)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedNeighborhood === n
                        ? "bg-[var(--foreground)] text-white border-[var(--foreground)]"
                        : "border-[var(--border)] hover:border-gray-400 text-[var(--muted)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Saved / Visited toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onShowSavedOnly(!showSavedOnly);
                  if (!showSavedOnly) onShowVisitedOnly(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  showSavedOnly
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "border-[var(--border)] hover:border-gray-400 text-[var(--muted)]"
                }`}
              >
                <Heart className="w-3 h-3" />
                Saved
              </button>
              <button
                onClick={() => {
                  onShowVisitedOnly(!showVisitedOnly);
                  if (!showVisitedOnly) onShowSavedOnly(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  showVisitedOnly
                    ? "bg-[var(--secondary)] text-white border-[var(--secondary)]"
                    : "border-[var(--border)] hover:border-gray-400 text-[var(--muted)]"
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                Visited
              </button>
            </div>
          </div>
        )}

        {/* Result count */}
        <p className="mt-2 text-xs text-[var(--muted)]">
          {resultCount} {resultCount === 1 ? "space" : "spaces"} found
        </p>
      </div>
    </div>
  );
}
