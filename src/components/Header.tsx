"use client";

import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  User,
  LogOut,
  Download,
  ChevronDown,
  Info,
  Shield,
  Trophy,
  Plus,
} from "lucide-react";
import { User as UserType } from "@/lib/hooks";
import { getTypeEmoji } from "@/lib/utils";

interface HeaderProps {
  user: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
  activeView: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
  isAdmin?: boolean;
  onExportData?: () => void;
  onAddPopos?: () => void;
  editCount?: number;
  visitedCount: number;
  totalCount: number;
  visitedTypes: Record<string, number>;
  showAbout: boolean;
  onToggleAbout: () => void;
}

function getPoposPersonality(visitedTypes: Record<string, number>): {
  title: string;
  emoji: string;
} {
  const total = Object.values(visitedTypes).reduce((a, b) => a + b, 0);
  if (total === 0) return { title: "Explorer Newbie", emoji: "🗺️" };
  if (total < 5) return { title: "Curious Wanderer", emoji: "🚶" };

  // Find dominant type
  const sorted = Object.entries(visitedTypes).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];

  const personalities: Record<string, { title: string; emoji: string }> = {
    Plaza: { title: "Plaza Connoisseur", emoji: "🏛️" },
    Park: { title: "Park Ranger", emoji: "🌳" },
    Garden: { title: "Green Thumb", emoji: "🌿" },
    "Indoor Space": { title: "Indoor Explorer", emoji: "✨" },
    Rooftop: { title: "Rooftop Chaser", emoji: "🌇" },
    Terrace: { title: "Sun Seeker", emoji: "☀️" },
    Walkway: { title: "Urban Walker", emoji: "🚶" },
    Snippet: { title: "Hidden Gem Hunter", emoji: "💎" },
  };

  if (total >= 20) return { title: "POPOS Master", emoji: "👑" };
  if (total >= 10)
    return personalities[top] || { title: "Space Enthusiast", emoji: "⭐" };
  return personalities[top] || { title: "Urban Explorer", emoji: "🏙️" };
}

export default function Header({
  user,
  onLoginClick,
  onLogout,
  activeView,
  onViewChange,
  isAdmin,
  onExportData,
  onAddPopos,
  editCount,
  visitedCount,
  totalCount,
  visitedTypes,
  showAbout,
  onToggleAbout,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const personality = getPoposPersonality(visitedTypes);
  const progressPct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="SF Hidden Parks" className="w-8 h-8 rounded-lg" />
            <button
              onClick={onToggleAbout}
              className="text-lg font-bold tracking-tight sm:pointer-events-none"
            >
              SF <span className="text-[#4A7C10]">Hidden Parks</span>
            </button>
            <button
              onClick={onToggleAbout}
              className={`ml-1 p-1 rounded-full transition-colors hidden sm:block ${
                showAbout
                  ? "text-[var(--primary)] bg-red-50"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              title="About POPOS"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => onViewChange("list")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeView === "list"
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              List
            </button>
            <button
              onClick={() => onViewChange("map")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeView === "map"
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Map
            </button>
          </div>

          {/* User / Profile Dropdown */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[var(--secondary)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] hidden sm:block" />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-[var(--border)] overflow-hidden animate-fade-in z-50">
                    {/* Profile Section */}
                    <div className="p-4 border-b border-[var(--border)]">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{personality.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm">{personality.title}</p>
                          <p className="text-xs text-[var(--muted)]">{user.email}</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">
                            <Trophy className="w-3 h-3 inline mr-1" />
                            {visitedCount} of {totalCount} visited
                          </span>
                          <span className="text-[var(--muted)]">{progressPct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--secondary)] to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                      {/* Top visited types */}
                      {Object.keys(visitedTypes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(visitedTypes)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 4)
                            .map(([type, count]) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-[var(--muted)]"
                              >
                                {getTypeEmoji(type)} {type} ({count})
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Admin Section */}
                    {isAdmin && (
                      <div className="border-b border-[var(--border)]">
                        <div className="px-4 py-2">
                          <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Admin
                          </p>
                        </div>
                        {onAddPopos && (
                          <button
                            onClick={() => {
                              onAddPopos();
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-[var(--muted)]" />
                            Add New Space
                          </button>
                        )}
                        {onExportData && (
                          <button
                            onClick={() => {
                              onExportData();
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                          >
                            <Download className="w-4 h-4 text-[var(--muted)]" />
                            Export Data
                            {editCount ? (
                              <span className="ml-auto px-1.5 py-0.5 bg-[var(--primary)] text-white text-[10px] rounded-full">
                                {editCount}
                              </span>
                            ) : null}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-full text-sm font-medium hover:shadow-md transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* About Section (expandable) */}
      {showAbout && (
        <div className="border-t border-[var(--border)] bg-amber-50 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="max-w-2xl">
              <h3 className="font-bold text-sm mb-2">
                San Francisco&apos;s Best-Kept Secret: Hidden Parks Everywhere
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                Scattered across downtown San Francisco are over 90 publicly
                accessible parks, plazas, gardens, and terraces that most people
                walk right past. They&apos;re called <strong>POPOS</strong> — Privately
                Owned Public Open Spaces — and they exist because the city has
                required developers to include public space in their buildings
                since the 1980s.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                Some are sunny rooftop gardens with panoramic views. Others are
                quiet indoor atriums tucked behind office lobbies, or pocket
                parks hidden down an alley. They&apos;re all free, open to the
                public, and waiting to be discovered.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                <strong>SF Hidden Parks</strong> is your guide to finding them
                all. Browse the list, explore the map, and track which ones
                you&apos;ve visited. Sign in to save your favorites and sync your
                progress across devices. How many can you find?
              </p>
              <p className="text-xs text-gray-500">
                Space data sourced from{" "}
                <a
                  href="https://data.sfgov.org/Culture-and-Recreation/Map-of-Privately-Owned-Public-Open-Spaces/33jz-gqck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] underline"
                >
                  DataSF
                </a>
                . Built with love for the city.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
