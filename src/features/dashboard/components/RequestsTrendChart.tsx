import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { DailyTrendPoint } from "@/features/dashboard/services/dashboard.service";
import type { MonthOption } from "@/features/dashboard/hooks/useMonthlyTrend";

const chartConfig = {
  count: {
    label: "Requests",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface RequestsTrendChartProps {
  data: DailyTrendPoint[];
  loading?: boolean;
  selectedMonth: MonthOption;
  monthOptions: MonthOption[];
  onMonthChange: (value: string) => void;
}

export function RequestsTrendChart({
  data,
  loading,
  selectedMonth,
  monthOptions,
  onMonthChange,
}: RequestsTrendChartProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Analytics</h3>
        </div>
        <Select value={selectedMonth.value} onValueChange={onMonthChange}>
          <SelectTrigger size="sm" className="w-35 rounded-xl text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="h-[260px] rounded-4xl bg-[#F9F9F9] border border-outline py-5 pr-5 pl-3">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} stroke="#EDEDED" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
                interval={1}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="border-none bg-primary text-white"
                    labelClassName="text-white font-medium"
                  />
                }
                cursor={{ fill: "#F1F3F1" }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                barSize={24}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </section>
  );
}
