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

// --- Auth (Google SSO + email fallback) ---
export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface GoogleCredentialResponse {
  credential: string;
}

function decodeJwt(token: string): Record<string, string> {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Load saved user on mount
  useEffect(() => {
    try {
      const u = localStorage.getItem("sfpopos_user");
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (document.getElementById("google-gsi-script")) {
      setGoogleLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleGoogleResponse = useCallback((response: GoogleCredentialResponse) => {
    const payload = decodeJwt(response.credential);
    const u: User = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
    localStorage.setItem("sfpopos_user", JSON.stringify(u));
    setUser(u);
  }, []);

  const loginWithGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !googleLoaded) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google as {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    google.accounts.id.prompt();
  }, [googleLoaded, handleGoogleResponse]);

  const loginWithEmail = useCallback((name: string, email: string) => {
    const u: User = { id: crypto.randomUUID(), name, email };
    localStorage.setItem("sfpopos_user", JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sfpopos_user");
    setUser(null);
  }, []);

  return {
    user,
    loginWithGoogle,
    loginWithEmail,
    logout,
    googleAvailable: !!GOOGLE_CLIENT_ID && googleLoaded,
  };
}
