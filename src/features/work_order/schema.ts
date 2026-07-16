import { z } from "zod";
import type { WorkOrderStatus } from "@/features/dashboard/services/dashboard.service";

/** Work order categories, in display order. Mirrors the `work_order_category`
 * Postgres enum (and the kced_mobile `WorkOrderCategory`). */
export const WORK_ORDER_CATEGORIES = [
  { dbValue: "repair", label: "Repair" },
  { dbValue: "maintenance", label: "Maintenance" },
  { dbValue: "installation", label: "Installation" },
  { dbValue: "inspection", label: "Inspection" },
] as const;

export type WorkOrderCategory = (typeof WORK_ORDER_CATEGORIES)[number]["dbValue"];

/** Display label for a category db value. */
export function categoryLabel(category: WorkOrderCategory): string {
  return WORK_ORDER_CATEGORIES.find((c) => c.dbValue === category)?.label ?? "Repair";
}

/** A row from the `work_orders` table (jurisdiction name/code joined in). */
export interface WorkOrder {
  id: string;
  /** Human-friendly work order number from the `work_order_number` column;
   * null for rows created before the column existed. */
  workOrderNumber: string | null;
  title: string;
  description: string;
  category: WorkOrderCategory;
  status: WorkOrderStatus;
  /** ISO timestamp, or null when no deadline is set. */
  deadline: string | null;
  completedAt: string | null;
  completionNotes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  jurisdictionId: number;
  /** The service request this order was created from; null if standalone. */
  serviceRequestId: string | null;
  leadTechnicianId: string | null;
  assetId: string | null;
  /** Joined from `jurisdictions(name)`. */
  jurisdictionName: string | null;
  /** Joined from `jurisdictions(code)`. */
  jurisdictionCode: string | null;
  /** The lead technician's profile, joined from `users`; null if unassigned. */
  leadTechnician: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
}

/** Short, human-friendly id for list display, e.g. `#a1b2c3d4`. */
export function shortId(order: WorkOrder): string {
  return `#${order.id.slice(0, 8)}`;
}

/** What to show as the order's number: the `work_order_number` when present,
 * falling back to [shortId] for older rows. */
export function displayNumber(order: WorkOrder): string {
  return order.workOrderNumber ?? shortId(order);
}

/** Whether the deadline has passed without the work being completed. */
export function isOverdue(order: WorkOrder): boolean {
  return (
    order.deadline !== null &&
    order.status !== "completed" &&
    new Date(order.deadline) < new Date()
  );
}

/** Single source of truth: validates the create/edit form AND infers its
 * types. Title is capped at 100 (the column is varchar(100)); a lead
 * technician is required at creation (app rule — the column is nullable). */
export const workOrderSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(100, "Keep the title under 100 characters."),
  description: z.string().trim(),
  jurisdiction_id: z
    .number({ error: "Select a jurisdiction." })
    .int()
    .positive("Select a jurisdiction."),
  category: z.enum(
    WORK_ORDER_CATEGORIES.map((c) => c.dbValue) as [WorkOrderCategory, ...WorkOrderCategory[]],
    { error: "Select a category." },
  ),
  lead_technician_id: z.string().min(1, "Select a lead technician."),
  /** `datetime-local` input value ("YYYY-MM-DDTHH:mm"), empty for none. */
  deadline: z.string(),
});

/** Form field values. */
export type WorkOrderValues = z.infer<typeof workOrderSchema>;
