"use client";

import { useState, useEffect, useCallback } from "react";

// --- Saved & Visited POPOS ---
export function useSavedPopos() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const s = localStorage.getItem("sfpopos_saved");
      const v = localStorage.getItem("sfpopos_visited");
      if (s) setSaved(new Set(JSON.parse(s)));
      if (v) setVisited(new Set(JSON.parse(v)));
    } catch {}
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("sfpopos_saved", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const toggleVisited = useCallback((id: string) => {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("sfpopos_visited", JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { saved, visited, toggleSaved, toggleVisited };
}

// --- User Location ---
export function useUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error };
}

// --- Search & Filter ---
export function useSearch() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showVisitedOnly, setShowVisitedOnly] = useState(false);

  const reset = useCallback(() => {
    setQuery("");
    setSelectedType(null);
    setSelectedNeighborhood(null);
    setShowSavedOnly(false);
    setShowVisitedOnly(false);
  }, []);

  return {
    query, setQuery,
    selectedType, setSelectedType,
    selectedNeighborhood, setSelectedNeighborhood,
    showSavedOnly, setShowSavedOnly,
    showVisitedOnly, setShowVisitedOnly,
    reset,
  };
}

// --- Auth (localStorage-based for MVP) ---
export interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("sfpopos_user");
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  const login = useCallback((name: string, email: string) => {
    const u: User = { id: crypto.randomUUID(), name, email };
    localStorage.setItem("sfpopos_user", JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sfpopos_user");
    setUser(null);
  }, []);

  return { user, login, logout };
}
