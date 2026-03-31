"use client";

import { useCallback, useEffect, useState } from "react";
import { POPOS, poposData } from "@/data/popos";

const ADMIN_EDITS_KEY = "sfpopos_admin_edits";
const ADMIN_ADDED_KEY = "sfpopos_admin_added";
const ADMIN_DELETED_KEY = "sfpopos_admin_deleted";
const ADMIN_EMAIL = "patrick.weiss@gmail.com";

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

type PoposEdits = Record<string, Partial<POPOS>>;

function loadEdits(): PoposEdits {
  try {
    const raw = localStorage.getItem(ADMIN_EDITS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveEdits(edits: PoposEdits) {
  localStorage.setItem(ADMIN_EDITS_KEY, JSON.stringify(edits));
}

function loadAdded(): POPOS[] {
  try {
    const raw = localStorage.getItem(ADMIN_ADDED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAdded(added: POPOS[]) {
  localStorage.setItem(ADMIN_ADDED_KEY, JSON.stringify(added));
}

function loadDeleted(): string[] {
  try {
    const raw = localStorage.getItem(ADMIN_DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDeleted(deleted: string[]) {
  localStorage.setItem(ADMIN_DELETED_KEY, JSON.stringify(deleted));
}

export function useAdminEdits() {
  const [edits, setEdits] = useState<PoposEdits>({});
  const [added, setAdded] = useState<POPOS[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);

  useEffect(() => {
    setEdits(loadEdits());
    setAdded(loadAdded());
    setDeleted(loadDeleted());
  }, []);

  const updatePopos = useCallback((id: string, updates: Partial<POPOS>) => {
    setEdits((prev) => {
      const next = { ...prev, [id]: { ...prev[id], ...updates } };
      saveEdits(next);
      return next;
    });
  }, []);

  const clearEdit = useCallback((id: string) => {
    setEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      saveEdits(next);
      return next;
    });
  }, []);

  const deletePopos = useCallback((id: string) => {
    setDeleted((prev) => {
      const next = [...prev, id];
      saveDeleted(next);
      return next;
    });
    // Also remove from added if it was a custom entry
    setAdded((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveAdded(next);
      return next;
    });
  }, []);

  const addPopos = useCallback((popos: POPOS) => {
    setAdded((prev) => {
      const next = [...prev, popos];
      saveAdded(next);
      return next;
    });
  }, []);

  const exportFullData = useCallback(() => {
    const merged = getMergedData(edits, added, deleted);
    const blob = new Blob([JSON.stringify(merged, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sfpopos-full-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [edits, added, deleted]);

  const editCount =
    Object.keys(edits).length + added.length + deleted.length;

  return {
    edits,
    added,
    deleted,
    updatePopos,
    clearEdit,
    deletePopos,
    addPopos,
    exportFullData,
    editCount,
  };
}

export function getMergedData(
  edits: PoposEdits,
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
