"use client";

import { useCallback, useEffect, useState } from "react";
import { POPOS, poposData } from "@/data/popos";
import { getSupabase, supabaseEnabled } from "./supabase";

const ADMIN_EMAIL = "patrick.weiss@gmail.com";
const TABLE = "admin_data";
const ROW_ID = "singleton";

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

async function loadFromSupabase(): Promise<AdminData | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from(TABLE)
      .select("edits, added, deleted")
      .eq("id", ROW_ID)
      .single();
    if (error || !data) return null;
    return {
      edits: data.edits || {},
      added: data.added || [],
      deleted: data.deleted || [],
    };
  } catch {
    return null;
  }
}

async function saveToSupabase(adminData: AdminData) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from(TABLE).upsert({
      id: ROW_ID,
      edits: adminData.edits,
      added: adminData.added,
      deleted: adminData.deleted,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error saving admin data to Supabase:", e);
  }
}

export function useAdminEdits() {
  const [data, setData] = useState<AdminData>(emptyAdmin);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (supabaseEnabled) {
        const sbData = await loadFromSupabase();
        if (sbData) {
          setData(sbData);
          saveToLocalStorage(sbData);
          setLoaded(true);
          return;
        }
      }
      // Fall back to localStorage
      setData(loadFromLocalStorage());
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback((newData: AdminData) => {
    saveToLocalStorage(newData);
    saveToSupabase(newData);
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
