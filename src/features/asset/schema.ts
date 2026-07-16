/** Asset types, in display order. Mirrors the `asset_type` Postgres enum. */
export const ASSET_TYPES = [
  { dbValue: "generator", label: "Generator" },
  { dbValue: "transformer", label: "Transformer" },
  { dbValue: "lift", label: "Lift" },
  { dbValue: "solar_pv", label: "Solar PV" },
  { dbValue: "streetlight", label: "Streetlight" },
  { dbValue: "air_conditioner", label: "Air Conditioner" },
] as const;

export type AssetType = (typeof ASSET_TYPES)[number]["dbValue"];

/** Asset conditions, in display order. Mirrors the `asset_condition` enum. */
export const ASSET_CONDITIONS = [
  { dbValue: "good", label: "Good" },
  { dbValue: "fair", label: "Fair" },
  { dbValue: "poor", label: "Poor" },
  { dbValue: "critical", label: "Critical" },
] as const;

export type AssetCondition = (typeof ASSET_CONDITIONS)[number]["dbValue"];

/** Operational statuses, in display order. Mirrors the `operational_status`
 * enum. */
export const OPERATIONAL_STATUSES = [
  { dbValue: "working", label: "Working" },
  { dbValue: "faulty", label: "Faulty" },
  { dbValue: "under_repair", label: "Under Repair" },
  { dbValue: "offline", label: "Offline" },
] as const;

export type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number]["dbValue"];

/** Prettify a db enum value we don't have a label for ("under_repair" →
 * "Under Repair") so an unexpected value still renders sensibly. */
export function prettifyDbValue(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function assetTypeLabel(type: string): string {
  return ASSET_TYPES.find((t) => t.dbValue === type)?.label ?? prettifyDbValue(type);
}

export function conditionLabel(condition: string): string {
  return (
    ASSET_CONDITIONS.find((c) => c.dbValue === condition)?.label ??
    prettifyDbValue(condition)
  );
}

export function operationalStatusLabel(status: string): string {
  return (
    OPERATIONAL_STATUSES.find((s) => s.dbValue === status)?.label ??
    prettifyDbValue(status)
  );
}

/** A row from the `assets` table (jurisdiction name/code joined in). */
export interface Asset {
  id: string;
  assetCode: string;
  assetType: AssetType;
  jurisdictionId: number | null;
  location: string | null;
  manufacturer: string | null;
  serialNumber: string | null;
  nameplatePhotoUrl: string | null;
  /** `date` column, "YYYY-MM-DD". */
  installationDate: string | null;
  condition: AssetCondition | null;
  operationalStatus: OperationalStatus | null;
  observedIssues: string | null;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  /** Type-specific fields; shape is defined by `ASSET_SPEC_FIELDS`. */
  specifications: Record<string, unknown>;
  createdAt: string | null;
  updatedAt: string | null;
  /** Joined from `jurisdictions(name)`. */
  jurisdictionName: string | null;
  /** Joined from `jurisdictions(code)`. */
  jurisdictionCode: string | null;
}
