import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const BUCKET = "photos";

export function isStorageConfigured(): boolean {
  return !!supabase;
}

export function getStorageDebugInfo(): string {
  const hasUrl = !!supabaseUrl;
  const hasKey = !!supabaseAnonKey;
  const urlPreview = supabaseUrl
    ? supabaseUrl.slice(0, 30) + "..."
    : "(empty)";
  const keyPreview = supabaseAnonKey
    ? supabaseAnonKey.slice(0, 20) + "..."
    : "(empty)";
  return `URL: ${urlPreview} | Key: ${keyPreview} | Client: ${supabase ? "yes" : "no"}`;
}

export async function uploadPoposPhoto(
  poposId: string,
  file: File
): Promise<string> {
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
