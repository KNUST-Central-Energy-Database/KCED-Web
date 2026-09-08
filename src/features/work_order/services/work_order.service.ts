import { supabase } from "@/lib/supabase";
import type { WorkOrder, WorkOrderValues } from "@/features/work_order/schema";
import type { UserRole } from "@/features/profile/services/profile.service";

const TABLE = "work_orders";

/**
 * Work order CRUD, mirroring the kced_mobile `WorkOrdersController`.
 * Admins see all; managers/technicians see only their jurisdiction.
 * Each throws on failure so callers can catch → toast/error state.
 */

/** A technician option for the lead-technician picker. */
export interface Technician {
  id: string;
  fullName: string;
  email: string;
}

/** Map a raw `work_orders` row (with joined jurisdiction) to a `WorkOrder`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWorkOrder(row: Record<string, any>): WorkOrder {
  const jurisdiction = row.jurisdictions ?? null;
  return {
    id: row.id,
    workOrderNumber: row.work_order_number?.toString() ?? null,
    title: row.title ?? "",
    description: row.description ?? "",
    category: row.category ?? "repair",
    status: row.status ?? "pending",
    deadline: row.deadline ?? null,
    completedAt: row.completed_at ?? null,
    completionNotes: row.completion_notes ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    jurisdictionId: row.jurisdiction_id,
    serviceRequestId: row.service_request_id ?? null,
    leadTechnicianId: row.lead_technician_id ?? null,
    assetId: row.asset_id ?? null,
    jurisdictionName: jurisdiction?.name ?? null,
    jurisdictionCode: jurisdiction?.code ?? null,
    leadTechnician: row.lead_technician
      ? {
          id: row.lead_technician.id,
          fullName: row.lead_technician.full_name ?? "",
          email: row.lead_technician.email ?? "",
          phone: row.lead_technician.phone ?? null,
          avatarUrl: row.lead_technician.avatar_url ?? null,
        }
      : null,
  };
}

/** Load work orders, newest first, with their jurisdiction name/code and
 *  lead technician's profile. Admins see all; managers/technicians see
 *  only their jurisdiction. */
export async function fetchWorkOrders(
  role?: UserRole | null,
  jurisdictionId?: number | null,
): Promise<WorkOrder[]> {
  const scoped = role && role !== "admin" && jurisdictionId != null;
  let query = supabase
    .from(TABLE)
    .select(
      "*, jurisdictions(name, code), lead_technician:users!lead_technician_id(id, full_name, email, phone, avatar_url)",
    );
  if (scoped) query = query.eq("jurisdiction_id", jurisdictionId!);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapWorkOrder);
}

/** The deadline form value ("YYYY-MM-DDTHH:mm" local) as UTC ISO, or null. */
function deadlineToIso(deadline: string): string | null {
  return deadline ? new Date(deadline).toISOString() : null;
}

/** Create a work order (status starts at `pending`). Pass [serviceRequestId]
 * when it was spawned from a service request; omit for standalone orders. */
export async function createWorkOrder(
  values: WorkOrderValues,
  serviceRequestId?: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).insert({
    title: values.title.trim(),
    description: values.description.trim(),
    jurisdiction_id: values.jurisdiction_id,
    category: values.category,
    status: "pending",
    lead_technician_id: values.lead_technician_id,
    deadline: deadlineToIso(values.deadline),
    ...(serviceRequestId ? { service_request_id: serviceRequestId } : {}),
  });
  if (error) {
    // 23505 = unique_violation on service_request_id.
    throw new Error(
      error.code === "23505"
        ? "A work order already exists for this request."
        : "Could not create the work order. Please try again.",
    );
  }
}

/** Update a work order's editable fields. An empty deadline clears the column. */
export async function updateWorkOrder(id: string, values: WorkOrderValues): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({
      title: values.title.trim(),
      description: values.description.trim(),
      jurisdiction_id: values.jurisdiction_id,
      category: values.category,
      lead_technician_id: values.lead_technician_id,
      deadline: deadlineToIso(values.deadline),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error("Could not update the work order. Please try again.");
}

/** Delete a work order. */
export async function deleteWorkOrder(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error("Could not delete the work order. Please try again.");
}

/** Link (or unlink, when assetId is null) an asset to a work order. */
export async function linkAsset(workOrderId: string, assetId: string | null): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({
      asset_id: assetId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workOrderId);
  if (error) throw new Error("Could not link the asset. Please try again.");
}

/** All work orders linked to [assetId], newest first — the asset's work order history. */
export async function fetchWorkOrderHistory(assetId: string): Promise<WorkOrder[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "*, jurisdictions(name, code), lead_technician:users!lead_technician_id(id, full_name, email, phone, avatar_url)",
    )
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapWorkOrder);
}

/**
 * Load active technicians in [jurisdictionId] for the lead technician picker,
 * ordered by name.
 */
export async function fetchTechnicians(jurisdictionId: number): Promise<Technician[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("role", "technician")
    .eq("status", "active")
    .eq("jurisdiction_id", jurisdictionId)
    .order("full_name");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email ?? "",
  }));
}
