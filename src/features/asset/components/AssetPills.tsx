import {
  conditionLabel,
  operationalStatusLabel,
  type AssetCondition,
  type OperationalStatus,
} from "@/features/asset/schema";

/** Pill colors per operational status, in the app's status-pill palette. */
const STATUS_COLORS: Record<OperationalStatus, { bg: string; fg: string }> = {
  working: { bg: "#DDF0E4", fg: "#0F4429" },
  faulty: { bg: "#FBEAE9", fg: "#B3261E" },
  under_repair: { bg: "#FDECD2", fg: "#8A5A00" },
  offline: { bg: "#EDEDED", fg: "#6B6B6B" },
};

/** Small coloured pill for an asset's operational status. */
export function OperationalStatusPill({ status }: { status: OperationalStatus }) {
  const { bg, fg } = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
  return (
    <span
      className="inline-block whitespace-nowrap rounded-[6px] px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: bg, color: fg }}
    >
      {operationalStatusLabel(status)}
    </span>
  );
}

/** Text colors per condition — shown as plain coloured text, not a pill, so
 * two pills don't compete on one row. */
const CONDITION_COLORS: Record<AssetCondition, string> = {
  good: "#1B6E44",
  fair: "#8A5A00",
  poor: "#B3261E",
  critical: "#B3261E",
};

/** Coloured condition label ("Good" / "Fair" / "Poor" / "Critical"). */
export function ConditionText({ condition }: { condition: AssetCondition }) {
  return (
    <span
      className="text-sm font-medium"
      style={{ color: CONDITION_COLORS[condition] ?? "#6B6B6B" }}
    >
      {conditionLabel(condition)}
    </span>
  );
}
