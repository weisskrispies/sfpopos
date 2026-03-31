"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  getFirebaseAuth,
  getFirebaseDb,
  getGoogleProvider,
  firebaseEnabled,
} from "./firebase";

// --- Saved & Visited POPOS ---
export function useSavedPopos() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [uid, setUid] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from Firestore when user is known
  useEffect(() => {
    if (!uid || !firebaseEnabled) {
      // Fall back to localStorage
      try {
        const s = localStorage.getItem("sfpopos_saved");
        const v = localStorage.getItem("sfpopos_visited");
        if (s) setSaved(new Set(JSON.parse(s)));
        if (v) setVisited(new Set(JSON.parse(v)));
      } catch {}
      setLoaded(true);
      return;
    }

    const loadUserData = async () => {
      try {
        const fdb = getFirebaseDb();
        if (!fdb) return;
        const snap = await getDoc(doc(fdb, "users", uid));
        if (snap.exists()) {
          const data = snap.data();
          const remoteSaved = new Set<string>(data.saved || []);
          const remoteVisited = new Set<string>(data.visited || []);
          // Merge any localStorage data that isn't in Firestore yet
          let localSaved: string[] = [];
          let localVisited: string[] = [];
          try {
            const s = localStorage.getItem("sfpopos_saved");
            const v = localStorage.getItem("sfpopos_visited");
            if (s) localSaved = JSON.parse(s);
            if (v) localVisited = JSON.parse(v);
          } catch {}
          let needsSync = false;
          for (const id of localSaved) {
            if (!remoteSaved.has(id)) { remoteSaved.add(id); needsSync = true; }
          }
          for (const id of localVisited) {
            if (!remoteVisited.has(id)) { remoteVisited.add(id); needsSync = true; }
          }
          setSaved(remoteSaved);
          setVisited(remoteVisited);
          // Push merged data back to Firestore if local had extra items
          if (needsSync) {
            setDoc(
              doc(fdb, "users", uid),
              { saved: [...remoteSaved], visited: [...remoteVisited] },
              { merge: true }
            ).catch(console.error);
          }
        } else {
          // No Firestore data yet — upload localStorage data
          let localSaved: string[] = [];
          let localVisited: string[] = [];
          try {
            const s = localStorage.getItem("sfpopos_saved");
            const v = localStorage.getItem("sfpopos_visited");
            if (s) localSaved = JSON.parse(s);
            if (v) localVisited = JSON.parse(v);
          } catch {}
          const newSaved = new Set(localSaved);
          const newVisited = new Set(localVisited);
          setSaved(newSaved);
          setVisited(newVisited);
          if (localSaved.length > 0 || localVisited.length > 0) {
            setDoc(
              doc(fdb, "users", uid),
              { saved: localSaved, visited: localVisited },
              { merge: true }
            ).catch(console.error);
          }
        }
      } catch (e) {
        console.error("Error loading user data:", e);
        try {
          const s = localStorage.getItem("sfpopos_saved");
          const v = localStorage.getItem("sfpopos_visited");
          if (s) setSaved(new Set(JSON.parse(s)));
          if (v) setVisited(new Set(JSON.parse(v)));
        } catch {}
      }
      setLoaded(true);
    };
    loadUserData();
  }, [uid]);

  const persist = useCallback(
    (newSaved: Set<string>, newVisited: Set<string>) => {
      const savedArr = [...newSaved];
      const visitedArr = [...newVisited];
      // Always save to localStorage as fallback
      localStorage.setItem("sfpopos_saved", JSON.stringify(savedArr));
      localStorage.setItem("sfpopos_visited", JSON.stringify(visitedArr));
      // Save to Firestore if available
      const fdb = getFirebaseDb();
      if (uid && fdb) {
        setDoc(
          doc(fdb, "users", uid),
          { saved: savedArr, visited: visitedArr },
          { merge: true }
        ).catch(console.error);
      }
    },
    [uid]
  );

  const toggleSaved = useCallback(
    (id: string) => {
      setSaved((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        persist(next, visited);
        return next;
      });
    },
    [persist, visited]
  );

  const toggleVisited = useCallback(
    (id: string) => {
      setVisited((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        persist(saved, next);
        return next;
      });
    },
    [persist, saved]
  );

  return { saved, visited, toggleSaved, toggleVisited, setUid, loaded };
}

// --- User Location ---
export function useUserLocation() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
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
  const [showNotVisitedOnly, setShowNotVisitedOnly] = useState(false);
  const [sortMode, setSortMode] = useState<"alpha" | "nearest">("alpha");

  const reset = useCallback(() => {
    setQuery("");
    setSelectedType(null);
    setSelectedNeighborhood(null);
    setShowSavedOnly(false);
    setShowVisitedOnly(false);
    setShowNotVisitedOnly(false);
  }, []);

  return {
    query,
    setQuery,
    selectedType,
    setSelectedType,
    selectedNeighborhood,
    setSelectedNeighborhood,
    showSavedOnly,
    setShowSavedOnly,
    showVisitedOnly,
    setShowVisitedOnly,
    showNotVisitedOnly,
    setShowNotVisitedOnly,
    sortMode,
    setSortMode,
    reset,
  };
}

// --- Auth (Firebase Google SSO) ---
export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseEnabled) {
      // Fall back to localStorage auth
      try {
        const u = localStorage.getItem("sfpopos_user");
        if (u) setUser(JSON.parse(u));
      } catch {}
      setLoading(false);
      return;
    }

    const fauth = getFirebaseAuth();
    if (!fauth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(fauth, (firebaseUser) => {
      if (firebaseUser) {
        const u: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          picture: firebaseUser.photoURL || undefined,
        };
        setUser(u);
        localStorage.setItem("sfpopos_user", JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem("sfpopos_user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!firebaseEnabled) return;
    const fauth = getFirebaseAuth();
    const provider = getGoogleProvider();
    if (!fauth || !provider) return;
    try {
      await signInWithPopup(fauth, provider);
    } catch (e) {
      console.error("Google sign-in error:", e);
    }
  }, []);

  const loginWithEmail = useCallback((name: string, email: string) => {
    const u: User = { id: crypto.randomUUID(), name, email };
    localStorage.setItem("sfpopos_user", JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    const fauth = getFirebaseAuth();
    if (fauth) {
      await signOut(fauth).catch(console.error);
    }
    localStorage.removeItem("sfpopos_user");
    setUser(null);
  }, []);

  return {
    user,
    loginWithGoogle,
    loginWithEmail,
    logout,
    googleAvailable: firebaseEnabled,
    loading,
  };
}
