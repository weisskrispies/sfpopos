"use client";

import { useCallback, useEffect, useState } from "react";
import { POPOS, poposData } from "@/data/popos";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb, firebaseEnabled } from "./firebase";

const ADMIN_EMAIL = "patrick.weiss@gmail.com";
const ADMIN_DOC = "settings/admin_data";

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

interface AdminData {
  edits: Record<string, Partial<POPOS>>;
  added: POPOS[];
  deleted: string[];
}

const emptyAdmin: AdminData = { edits: {}, added: [], deleted: [] };

// localStorage fallback keys
const LS_EDITS = "sfpopos_admin_edits";
const LS_ADDED = "sfpopos_admin_added";
const LS_DELETED = "sfpopos_admin_deleted";

function loadFromLocalStorage(): AdminData {
  try {
    return {
      edits: JSON.parse(localStorage.getItem(LS_EDITS) || "{}"),
      added: JSON.parse(localStorage.getItem(LS_ADDED) || "[]"),
      deleted: JSON.parse(localStorage.getItem(LS_DELETED) || "[]"),
    };
  } catch {
    return emptyAdmin;
  }
}

function saveToLocalStorage(data: AdminData) {
  localStorage.setItem(LS_EDITS, JSON.stringify(data.edits));
  localStorage.setItem(LS_ADDED, JSON.stringify(data.added));
  localStorage.setItem(LS_DELETED, JSON.stringify(data.deleted));
}

async function saveToFirestore(data: AdminData) {
  const fdb = getFirebaseDb();
  if (!fdb) return;
  try {
    await setDoc(doc(fdb, ADMIN_DOC), data);
  } catch (e) {
    console.error("Error saving admin data to Firestore:", e);
  }
}

export function useAdminEdits() {
  const [data, setData] = useState<AdminData>(emptyAdmin);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!firebaseEnabled) {
      setData(loadFromLocalStorage());
      setLoaded(true);
      return;
    }

    const fdb = getFirebaseDb();
    if (!fdb) {
      setData(loadFromLocalStorage());
      setLoaded(true);
      return;
    }
    // Listen for real-time updates from Firestore
    const unsubscribe = onSnapshot(
      doc(fdb, ADMIN_DOC),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data() as AdminData;
          setData({
            edits: d.edits || {},
            added: d.added || [],
            deleted: d.deleted || [],
          });
          // Also cache locally
          saveToLocalStorage({
            edits: d.edits || {},
            added: d.added || [],
            deleted: d.deleted || [],
          });
        }
        setLoaded(true);
      },
      (err) => {
        console.error("Firestore listen error:", err);
        // Fall back to localStorage
        setData(loadFromLocalStorage());
        setLoaded(true);
      }
    );

    return () => unsubscribe();
  }, []);

  const persist = useCallback((newData: AdminData) => {
    saveToLocalStorage(newData);
    saveToFirestore(newData);
  }, []);

  const updatePopos = useCallback(
    (id: string, updates: Partial<POPOS>) => {
      setData((prev) => {
        const next = {
          ...prev,
          edits: { ...prev.edits, [id]: { ...prev.edits[id], ...updates } },
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearEdit = useCallback(
    (id: string) => {
      setData((prev) => {
        const edits = { ...prev.edits };
        delete edits[id];
        const next = { ...prev, edits };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const deletePopos = useCallback(
    (id: string) => {
      setData((prev) => {
        const next = {
          ...prev,
          deleted: [...prev.deleted, id],
          added: prev.added.filter((p) => p.id !== id),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const addPopos = useCallback(
    (popos: POPOS) => {
      setData((prev) => {
        const next = { ...prev, added: [...prev.added, popos] };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const exportFullData = useCallback(() => {
    const merged = getMergedData(data.edits, data.added, data.deleted);
    const blob = new Blob([JSON.stringify(merged, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sfpopos-full-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const editCount =
    Object.keys(data.edits).length + data.added.length + data.deleted.length;

  return {
    edits: data.edits,
    added: data.added,
    deleted: data.deleted,
    updatePopos,
    clearEdit,
    deletePopos,
    addPopos,
    exportFullData,
    editCount,
    loaded,
  };
}

export function getMergedData(
  edits: Record<string, Partial<POPOS>>,
  added: POPOS[] = [],
  deleted: string[] = []
): POPOS[] {
  const base = poposData
    .filter((p) => !deleted.includes(p.id))
    .map((p) => {
      const edit = edits[p.id];
      if (!edit) return p;
      return { ...p, ...edit, id: p.id };
    });
  const addedFiltered = added.filter((p) => !deleted.includes(p.id));
  return [...base, ...addedFiltered];
}
