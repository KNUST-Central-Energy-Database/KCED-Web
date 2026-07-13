import { supabase } from "@/lib/supabase";
import type {
  Jurisdiction,
  ServiceRequestInsert,
  ServiceRequestValues,
} from "@/features/service_request/schema";

export const TABLE = "service_requests";
export const BUCKET = "Service Request Images";

/**
 * Load the jurisdictions (areas) for the request form's picker, ordered for
 * display. Mirrors the kced_mobile `fetchJurisdictions`. Throws on failure.
 */
export async function fetchJurisdictions(): Promise<Jurisdiction[]> {
  const { data, error } = await supabase
    .from("jurisdictions")
    .select("id, name, code")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

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

/**
 * Submit a service request: upload any images, then insert the row.
 * Throws if uploading or inserting fails.
 */
export async function submitServiceRequest(
  values: ServiceRequestValues,
  files: File[],
): Promise<void> {
  const images = await Promise.all(files.map(uploadImage));
  const payload: ServiceRequestInsert = { ...values, submitted_images: images };

  const { error } = await supabase.from(TABLE).insert(payload);
  if (error) throw error;
}
