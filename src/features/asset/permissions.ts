import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/features/profile/services/profile.service";
import type { Asset } from "@/features/asset/schema";
import type { WorkOrder } from "@/features/work_order/schema";

/** Who may create assets: everyone except technicians. */
export function canCreateAsset(role: UserRole | null): boolean {
  return role === "admin" || role === "manager";
}

/**
 * Who may edit a given asset, when the asset's work-order `history` is
 * already loaded (the detail dialog fetches it).
 *
 * - Admins: any asset.
 * - Managers: assets in their own jurisdiction.
 * - Technicians: only assets with a linked work order assigned to them
 *   (`lead_technician_id`) that isn't completed yet — access ends when the
 *   work is done.
 *
 * Pass an empty `history` when it hasn't loaded yet: technicians are denied
 * until it has; admins/managers are unaffected.
 */
export function canEditAsset({
  role,
  jurisdictionId,
  asset,
  currentUserId,
  history,
}: {
  role: UserRole | null;
  jurisdictionId: number | null;
  asset: Asset;
  currentUserId: string | null;
  history: WorkOrder[];
}): boolean {
  if (role === "admin") return true;
  if (role === "manager") {
    return jurisdictionId !== null && asset.jurisdictionId === jurisdictionId;
  }
  if (role === "technician" && currentUserId) {
    return history.some(
      (wo) => wo.leadTechnicianId === currentUserId && wo.status !== "completed",
    );
  }
  return false;
}

/**
 * Whether `userId` is the lead technician on any not-yet-completed work order
 * linked to `assetId`. For guards where the work-order history isn't loaded
 * (the edit flow's belt-and-braces check).
 */
export async function hasOpenAssignment(
  assetId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("work_orders")
    .select("id")
    .eq("asset_id", assetId)
    .eq("lead_technician_id", userId)
    .neq("status", "completed")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}
