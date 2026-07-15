import { supabase } from "@/lib/supabase";
import type {
  Jurisdiction,
  ServiceRequest,
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

/** Map a raw `service_requests` row (with joined jurisdiction) to a `ServiceRequest`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapServiceRequest(row: Record<string, any>): ServiceRequest {
  const jurisdiction = row.jurisdictions ?? null;
  return {
    id: row.id,
    requestNumber: row.request_number?.toString() ?? null,
    issue: row.issue ?? "",
    description: row.description ?? "",
    location: row.location ?? "",
    reporter: row.reporter ?? "",
    reporterEmail: row.reporter_email ?? "",
    submittedImages: (row.submitted_images ?? []).map(String),
    status: row.status ?? "pending",
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    jurisdictionId: row.jurisdiction_id ?? null,
    jurisdictionName: jurisdiction?.name ?? null,
    jurisdictionCode: jurisdiction?.code ?? null,
  };
}

/**
 * Load all service requests, newest first, with their jurisdiction name/code.
 * The web counterpart of the kced_mobile `ServiceRequestsController.load()`
 * (admin-facing, so no jurisdiction scoping).
 */
export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*, jurisdictions(name, code)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapServiceRequest);
}

/** Delete a service request. */
export async function deleteServiceRequest(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error("Could not delete the request. Please try again.");
}
