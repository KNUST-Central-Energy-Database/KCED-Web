import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import {
  WORK_ORDER_STATUSES,
  type WorkOrderStatus,
} from "@/features/dashboard/services/dashboard.service";

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  pending: "#F59E0B",
  overdue: "#EF4444",
  "in progress": "#3B82F6",
  completed: "#10B981",
};

const chartConfig = Object.fromEntries(
  WORK_ORDER_STATUSES.map(({ dbValue, label }) => [
    dbValue,
    { label, color: STATUS_COLORS[dbValue] },
  ]),
) satisfies ChartConfig;

interface JobsStatusProps {
  workOrdersByStatus: Record<WorkOrderStatus, number> | null;
  totalWorkOrders: number | null;
  loading?: boolean;
}

export function JobsStatus({ workOrdersByStatus, totalWorkOrders, loading }: JobsStatusProps) {
  const chartData = WORK_ORDER_STATUSES.map(({ dbValue, label }) => ({
    name: label,
    value: workOrdersByStatus?.[dbValue] ?? 0,
    fill: STATUS_COLORS[dbValue],
  }));

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold tracking-tight">Jobs Status</h3>
      <div className="flex w-fit items-center gap-6 rounded-4xl border border-outline bg-[#F9F9F9] p-6">
        <div className="h-[200px] w-[200px] shrink-0">
          {loading ? (
            <Skeleton className="h-full w-full rounded-full" />
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {WORK_ORDER_STATUSES.map(({ dbValue, label }) => {
            const count = workOrdersByStatus?.[dbValue] ?? 0;
            const percent = totalWorkOrders ? Math.round((count / totalWorkOrders) * 100) : 0;

            return (
              <div key={dbValue} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[dbValue] }}
                />
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="ml-auto text-sm font-medium tabular-nums">
                  {count} <span className="text-muted-foreground">({percent}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
