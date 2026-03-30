"use client";

import { MapPin, User, LogOut } from "lucide-react";
import { User as UserType } from "@/lib/hooks";

interface HeaderProps {
  user: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
  activeView: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
}

export default function Header({
  user,
  onLoginClick,
  onLogout,
  activeView,
  onViewChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              SF <span className="text-[var(--primary)]">POPOS</span>
            </span>
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

          {/* User */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--secondary)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {user.name}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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
    </header>
  );
}
