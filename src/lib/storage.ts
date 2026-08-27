import { getSupabase, getSupabaseDebugInfo } from "./supabase";

export { getSupabaseDebugInfo as getStorageDebugInfo };

const BUCKET = "photos";

export function isStorageConfigured(): boolean {
  return !!getSupabase();
}

export async function uploadPoposPhoto(
  poposId: string,
  file: File
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error(
      "Storage not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${poposId}/${filename}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
