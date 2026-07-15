import {
  SERVICE_REQUEST_STATUSES,
  type ServiceRequestStatus,
} from "@/features/service_request/schema";

/** Pill colors per status, ported from the mobile `StatusPill`. */
const STATUS_COLORS: Record<ServiceRequestStatus, { bg: string; fg: string }> = {
  pending: { bg: "#FDECD2", fg: "#8A5A00" },
  in_progress: { bg: "#D9E7FB", fg: "#1B4E8A" },
  resolved: { bg: "#DDF0E4", fg: "#0F4429" },
};

/** Small coloured pill for a service request status. */
export function RequestStatusPill({ status }: { status: ServiceRequestStatus }) {
  const { bg, fg } = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  const label =
    SERVICE_REQUEST_STATUSES.find((s) => s.dbValue === status)?.label ?? "Pending";
  return (
    <span
      className="inline-block whitespace-nowrap rounded-[6px] px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </span>
  );
}
