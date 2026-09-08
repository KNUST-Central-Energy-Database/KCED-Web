import { supabase } from "@/lib/supabase";
import type { Asset } from "@/features/asset/schema";
import type { UserRole } from "@/features/profile/services/profile.service";

const TABLE = "assets";

/**
 * Asset queries. Throws on failure so callers can catch → error state.
 */

/** Map a raw `assets` row (with joined jurisdiction) to an `Asset`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAsset(row: Record<string, any>): Asset {
  const jurisdiction = row.jurisdictions ?? null;
  return {
    id: row.id,
    assetCode: row.asset_code ?? "",
    assetType: row.asset_type,
    jurisdictionId: row.jurisdiction_id ?? null,
    location: row.location ?? null,
    manufacturer: row.manufacturer ?? null,
    serialNumber: row.serial_number ?? null,
    nameplatePhotoUrl: row.nameplate_photo_url ?? null,
    installationDate: row.installation_date ?? null,
    condition: row.condition ?? null,
    operationalStatus: row.operational_status ?? null,
    observedIssues: row.observed_issues ?? null,
    lastMaintenance: row.last_maintenance ?? null,
    nextMaintenance: row.next_maintenance ?? null,
    specifications: row.specifications ?? {},
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    jurisdictionName: jurisdiction?.name ?? null,
    jurisdictionCode: jurisdiction?.code ?? null,
  };
}

/** Load assets, newest first, with their jurisdiction name/code.
 *  Admins see all; managers/technicians see only their jurisdiction. */
export async function fetchAssets(
  role?: UserRole | null,
  jurisdictionId?: number | null,
): Promise<Asset[]> {
  const scoped = role && role !== "admin" && jurisdictionId != null;
  let query = supabase
    .from(TABLE)
    .select("*, jurisdictions(name, code)");
  if (scoped) query = query.eq("jurisdiction_id", jurisdictionId!);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAsset);
}

/** Create a new asset. Returns the created asset. */
export async function createAsset(
  asset: Pick<Asset, "assetCode" | "assetType" | "jurisdictionId"> &
    Partial<Pick<Asset, "location" | "manufacturer" | "serialNumber" | "installationDate" | "condition" | "operationalStatus" | "observedIssues" | "lastMaintenance" | "nextMaintenance" | "specifications">>,
): Promise<Asset> {
  const payload: Record<string, unknown> = {
    asset_code: asset.assetCode,
    asset_type: asset.assetType,
    jurisdiction_id: asset.jurisdictionId,
  };
  if (asset.location) payload.location = asset.location;
  if (asset.manufacturer) payload.manufacturer = asset.manufacturer;
  if (asset.serialNumber) payload.serial_number = asset.serialNumber;
  if (asset.installationDate) payload.installation_date = asset.installationDate;
  if (asset.condition) payload.condition = asset.condition;
  if (asset.operationalStatus) payload.operational_status = asset.operationalStatus;
  if (asset.observedIssues) payload.observed_issues = asset.observedIssues;
  if (asset.lastMaintenance) payload.last_maintenance = asset.lastMaintenance;
  if (asset.nextMaintenance) payload.next_maintenance = asset.nextMaintenance;
  if (asset.specifications && Object.keys(asset.specifications).length > 0) {
    payload.specifications = asset.specifications;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*, jurisdictions(name, code)")
    .single();
  if (error) throw error;
  return mapAsset(data);
}

/** Update an asset's editable fields. */
export async function updateAsset(
  id: string,
  updates: {
    manufacturer?: string | null;
    serialNumber?: string | null;
    location?: string | null;
    installationDate?: string | null;
    condition?: Asset["condition"];
    operationalStatus?: Asset["operationalStatus"];
    observedIssues?: string | null;
    lastMaintenance?: string | null;
    nextMaintenance?: string | null;
    specifications?: Record<string, unknown>;
  },
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.manufacturer !== undefined) payload.manufacturer = updates.manufacturer || null;
  if (updates.serialNumber !== undefined) payload.serial_number = updates.serialNumber || null;
  if (updates.location !== undefined) payload.location = updates.location || null;
  if (updates.installationDate !== undefined) payload.installation_date = updates.installationDate || null;
  if (updates.condition !== undefined) payload.condition = updates.condition;
  if (updates.operationalStatus !== undefined) payload.operational_status = updates.operationalStatus;
  if (updates.observedIssues !== undefined) payload.observed_issues = updates.observedIssues || null;
  if (updates.lastMaintenance !== undefined) payload.last_maintenance = updates.lastMaintenance || null;
  if (updates.nextMaintenance !== undefined) payload.next_maintenance = updates.nextMaintenance || null;
  if (updates.specifications !== undefined) payload.specifications = updates.specifications;

  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase.from(TABLE).update(payload).eq("id", id);
  if (error) throw new Error("Could not update asset. Please try again.");
}

/** Fetch a single asset by ID. Returns null when not found. */
export async function fetchAssetById(id: string): Promise<Asset | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*, jurisdictions(name, code)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAsset(data) : null;
}
