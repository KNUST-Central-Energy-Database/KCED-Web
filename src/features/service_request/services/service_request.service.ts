import { supabase } from "@/lib/supabase";
import type {
  Jurisdiction,
  ServiceRequest,
  ServiceRequestInsert,
  ServiceRequestStatus,
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
    reporterContact: row.reporter_contact ?? "",
    submittedImages: (row.submitted_images ?? []).map(String),
    status: row.status ?? "submitted",
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

/**
 * Cancel a service request (soft delete — sets status to "cancelled").
 * Refuses if a work order has already been created from the request.
 */
export async function cancelServiceRequest(id: string): Promise<void> {
  const { count, error: countError } = await supabase
    .from("work_orders")
    .select("id", { count: "exact", head: true })
    .eq("service_request_id", id);
  if (countError) throw new Error("Could not cancel the request. Please try again.");
  if ((count ?? 0) > 0) {
    throw new Error(
      "This request has a work order attached. Delete the work order first.",
    );
  }

  const { error } = await supabase
    .from(TABLE)
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw new Error("Could not cancel the request. Please try again.");
}

/** Reopen a cancelled service request — puts it back to "submitted". */
export async function reopenServiceRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ status: "submitted" })
    .eq("id", id);
  if (error) throw new Error("Could not reopen the request. Please try again.");
}

/** What the public tracking page shows about a request. */
export interface TrackedRequest {
  requestNumber: string;
  status: ServiceRequestStatus;
  createdAt: string | null;
}

/**
 * Look up a request by its `request_number` for the public tracking page.
 * Calls the `track-request` edge function which joins service_requests
 * with work_orders to compute the real-time tracking status.
 * Returns null when no request matches.
 */
export async function trackServiceRequest(
  requestNumber: string,
): Promise<TrackedRequest | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/track-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ requestNumber: requestNumber.trim() }),
  });

  if (!res.ok) throw new Error(`Tracking request failed: ${res.statusText}`);

  const { data, error } = await res.json();
  if (error) throw new Error(error);
  if (!data) return null;

  return {
    requestNumber: data.requestNumber,
    status: data.status as ServiceRequestStatus,
    createdAt: data.createdAt,
  };
}
