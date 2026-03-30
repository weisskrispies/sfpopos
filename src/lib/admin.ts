"use client";

import { useCallback, useEffect, useState } from "react";
import { POPOS, poposData } from "@/data/popos";

const ADMIN_EDITS_KEY = "sfpopos_admin_edits";
const ADMIN_EMAIL = "weisskrispies@gmail.com"; // change to your email

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  // Allow any Google-authenticated user for now, or lock to specific email
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || email.endsWith("@gmail.com");
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

export function useAdminEdits() {
  const [edits, setEdits] = useState<PoposEdits>({});

  useEffect(() => {
    setEdits(loadEdits());
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

  const exportEdits = useCallback(() => {
    const data = loadEdits();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sfpopos-edits-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportFullData = useCallback(() => {
    const merged = getMergedData(edits);
    const blob = new Blob([JSON.stringify(merged, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sfpopos-full-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [edits]);

  const editCount = Object.keys(edits).length;

  return { edits, updatePopos, clearEdit, exportEdits, exportFullData, editCount };
}

export function getMergedData(edits: PoposEdits): POPOS[] {
  return poposData.map((p) => {
    const edit = edits[p.id];
    if (!edit) return p;
    return { ...p, ...edit, id: p.id };
  });
}
