import { CalendarCheck, CheckCircle2, Clock, Timer, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  WORK_ORDER_STATUSES,
  type WorkOrderStatus,
} from "@/features/dashboard/services/dashboard.service";

const STATUS_ICONS: Record<WorkOrderStatus, ComponentType<LucideProps>> = {
  pending: CalendarCheck,
  "en route": Clock,
  "in progress": Timer,
  completed: CheckCircle2,
};

interface JobsStatusProps {
  workOrdersByStatus: Record<WorkOrderStatus, number> | null;
  totalWorkOrders: number | null;
  loading?: boolean;
}

/**
 * Work order counts per status with each status's share of the total,
 * ported from the mobile "Jobs Status" tiles. Laid out as a grid on
 * desktop instead of the mobile vertical stack.
 */
export function JobsStatus({ workOrdersByStatus, totalWorkOrders, loading }: JobsStatusProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xl font-medium tracking-tight">Jobs Status</h3>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {WORK_ORDER_STATUSES.map(({ dbValue, label }) => {
          const Icon = STATUS_ICONS[dbValue];
          const count = workOrdersByStatus?.[dbValue] ?? null;
          const percent =
            count !== null && totalWorkOrders
              ? Math.round((count / totalWorkOrders) * 100)
              : null;

          return (
            <div
              key={dbValue}
              className="flex items-center gap-2.5 rounded-[10px] bg-[#F9F9F9] p-3.5"
            >
              <Icon className="size-[18px] shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{label}</p>
                {loading ? (
                  <Skeleton className="mt-1 h-4 w-14" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {count === null ? "—" : `${count} ${count === 1 ? "job" : "jobs"}`}
                  </p>
                )}
              </div>
              {percent !== null && (
                <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-on-soft">
                  {percent}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
