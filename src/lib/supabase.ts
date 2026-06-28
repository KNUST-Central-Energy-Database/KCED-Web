import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Warn instead of crashing so the page still renders before keys are set.
  // Submitting will fail (and show the error message) until .env is filled.
  console.error(
    "Missing Supabase env vars. Copy .env.example to .env and fill them in.",
  );
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);

export const TABLE = "service_requests";
export const BUCKET = "request-images";

/**
 * Upload one image to the Storage bucket and return its public URL.
 * Throws if the upload fails.
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
