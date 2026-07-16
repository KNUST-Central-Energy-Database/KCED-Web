import { supabase } from "@/lib/supabase";
import type { Asset } from "@/features/asset/schema";

const TABLE = "assets";

/**
 * Asset queries. Read-only for now — create/edit lands later. The web portal
 * is admin-facing, so queries are global (no jurisdiction scoping). Throws on
 * failure so callers can catch → error state.
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

/** Load all assets, newest first, with their jurisdiction name/code. */
export async function fetchAssets(): Promise<Asset[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*, jurisdictions(name, code)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAsset);
}
