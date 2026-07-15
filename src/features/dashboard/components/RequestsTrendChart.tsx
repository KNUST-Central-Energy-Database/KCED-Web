import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeeklyTrendPoint } from "@/features/dashboard/services/dashboard.service";

interface RequestsTrendChartProps {
  data: WeeklyTrendPoint[];
  loading?: boolean;
}

/**
 * Bar chart of service requests per week for the current month. Mirrors the
 * mobile trend chart's look: primary green bars, light horizontal gridlines,
 * muted axis labels — but computed from real `created_at` data.
 */
export function RequestsTrendChart({ data, loading }: RequestsTrendChartProps) {
  const monthLabel = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-xl font-medium tracking-tight">Service Requests Trend</h3>
        <p className="text-sm text-muted-foreground">{monthLabel}</p>
      </div>
      <div className="h-[260px] rounded-[10px] border border-outline bg-background py-5 pr-5 pl-3">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} stroke="#EDEDED" />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#F1F3F1" }}
                contentStyle={{
                  backgroundColor: "var(--primary)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#fff", fontWeight: 500 }}
              />
              <Bar
                dataKey="count"
                name="Requests"
                fill="var(--primary)"
                barSize={24}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
