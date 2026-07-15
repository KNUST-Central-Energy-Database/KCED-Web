import type { WorkOrderStatus } from "@/features/dashboard/services/dashboard.service";
import { WORK_ORDER_STATUSES } from "@/features/dashboard/services/dashboard.service";

/** Pill colors per status, ported from the mobile `WorkOrderStatusPill`. */
const STATUS_COLORS: Record<WorkOrderStatus, { bg: string; fg: string }> = {
  pending: { bg: "#FDECD2", fg: "#8A5A00" },
  "en route": { bg: "#EDE4FA", fg: "#54348A" },
  "in progress": { bg: "#D9E7FB", fg: "#1B4E8A" },
  completed: { bg: "#DDF0E4", fg: "#0F4429" },
};

/** Small coloured pill for a work order status, used on the table rows. */
export function WorkOrderStatusPill({ status }: { status: WorkOrderStatus }) {
  const { bg, fg } = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  const label =
    WORK_ORDER_STATUSES.find((s) => s.dbValue === status)?.label ?? "Pending";
  return (
    <span
      className="inline-block whitespace-nowrap rounded-[6px] px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </span>
  );
}
