import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Boxes, ClipboardList, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/features/auth/services/auth.service";
import { InsightCard } from "@/features/dashboard/components/InsightCard";
import { JobsStatus } from "@/features/dashboard/components/JobsStatus";
import { JurisdictionShares } from "@/features/dashboard/components/JurisdictionShares";
import { RequestsTrendChart } from "@/features/dashboard/components/RequestsTrendChart";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

// The `/dashboard` layout route (route.tsx) supplies the sidebar shell and the
// requireAuth guard; this is the dashboard home, ported from the kced_mobile
// home screen (greeting, insight cards, trend chart, jobs status,
// jurisdiction shares).
export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

/** Time-of-day greeting, matching the mobile home screen. */
function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardIndex() {
  const { data, loading, error, reload } = useDashboardData();
  const [firstName, setFirstName] = useState<string>();

  useEffect(() => {
    getSession().then((session) => {
      const fullName = session?.user?.user_metadata?.full_name as string | undefined;
      setFirstName(fullName?.trim().split(/\s+/)[0]);
    });
  }, []);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const counts = data?.counts ?? null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      {/* Greeting */}
      <div className="flex flex-col gap-0.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-[10px] border border-error/30 bg-error/5 px-4 py-3">
          <p className="text-sm text-error">{error}</p>
          <Button variant="outline" size="sm" onClick={reload}>
            Retry
          </Button>
        </div>
      )}

      {/* Overview */}
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-xl font-medium tracking-tight">Overview</h3>
          <p className="text-sm text-muted-foreground">View your dashboard insights</p>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            title="Total Users"
            icon={Users}
            count={counts?.userCount ?? null}
            loading={loading}
            to="/dashboard/users"
          />
          <InsightCard
            title="Total Work Orders"
            icon={Wrench}
            count={counts?.workOrderCount ?? null}
            loading={loading}
            to="/dashboard/work-orders"
          />
          <InsightCard
            title="Total Requests"
            icon={ClipboardList}
            count={counts?.requestCount ?? null}
            loading={loading}
            to="/dashboard/service-requests"
          />
          <InsightCard
            title="Total Assets"
            icon={Boxes}
            count={counts?.assetCount ?? null}
            loading={loading}
            to="/dashboard/assets"
          />
        </div>
      </section>

      {/* Trend + jobs status side by side on wide screens */}
      <div className="grid gap-8 lg:grid-cols-2">
        <RequestsTrendChart data={data?.weeklyTrend ?? []} loading={loading} />
        <JobsStatus
          workOrdersByStatus={counts?.workOrdersByStatus ?? null}
          totalWorkOrders={counts?.workOrderCount ?? null}
          loading={loading}
        />
      </div>

      <JurisdictionShares shares={data?.jurisdictionShares ?? null} loading={loading} />
    </div>
  );
}
