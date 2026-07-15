import { z } from "zod";

/** A row from the `jurisdictions` table, fetched to populate the area picker. */
export interface Jurisdiction {
  id: number;
  name: string;
  code: string;
}

const required = (message = "This field is required.") =>
  z.string().trim().min(1, message);

/** Single source of truth: validates the form AND infers its types. */
export const serviceRequestSchema = z.object({
  issue: required(),
  description: required(),
  // The picker holds the selected jurisdiction's id (FK into `jurisdictions`).
  jurisdiction_id: z
    .number({ error: "Please select an area." })
    .int()
    .positive("Please select an area."),
  location: required(),
  reporter: required(),
  reporter_email: z.email('Enter a valid email'),
});

/** Form field values. */
export type ServiceRequestValues = z.infer<typeof serviceRequestSchema>;

/** Row inserted into Supabase: the form values plus uploaded image URLs. */
export interface ServiceRequestInsert extends ServiceRequestValues {
  submitted_images: string[];
}

/**
 * Service request statuses, in display order. Mirrors the kced_mobile
 * `ServiceRequestStatus` — rows without a `status` column value default to
 * `pending`.
 */
export const SERVICE_REQUEST_STATUSES = [
  { dbValue: "pending", label: "Pending" },
  { dbValue: "in_progress", label: "In Progress" },
  { dbValue: "resolved", label: "Resolved" },
] as const;

export type ServiceRequestStatus = (typeof SERVICE_REQUEST_STATUSES)[number]["dbValue"];

/** A row from the `service_requests` table (jurisdiction name/code joined in). */
export interface ServiceRequest {
  id: string;
  /** Human-friendly request number; null for rows created before the column. */
  requestNumber: string | null;
  issue: string;
  description: string;
  location: string;
  reporter: string;
  reporterEmail: string;
  submittedImages: string[];
  status: ServiceRequestStatus;
  createdAt: string | null;
  updatedAt: string | null;
  /** Null for requests not tied to a jurisdiction. */
  jurisdictionId: number | null;
  /** Joined from `jurisdictions(name)`; null when unassigned. */
  jurisdictionName: string | null;
  /** Joined from `jurisdictions(code)`; null when unassigned. */
  jurisdictionCode: string | null;
}

/** What to show as the request's number: `request_number` when present,
 * falling back to a short `#id` for older rows. */
export function displayNumber(request: ServiceRequest): string {
  return request.requestNumber ?? `#${request.id.slice(0, 8)}`;
}
