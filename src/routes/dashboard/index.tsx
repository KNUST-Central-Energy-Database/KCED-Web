import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getSession } from "@/features/auth/services/auth.service";
import { InsightCard } from "@/features/dashboard/components/InsightCard";
import { JobsStatus } from "@/features/dashboard/components/JobsStatus";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { QuickActionCard } from "@/features/dashboard/components/QuickActionCard";
import { Boxes, UserPlus, Briefcase } from "lucide-react";
import { RequestsTrendChart } from "@/features/dashboard/components/RequestsTrendChart";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useMonthlyTrend } from "@/features/dashboard/hooks/useMonthlyTrend";
import { InviteUserDialog } from "@/features/user/components/InviteUserDialog";
import { fetchProfile, type Profile } from "@/features/profile/services/profile.service";
import { useUsers } from "@/features/user/hooks/useUsers";
import { WorkOrderFormDialog } from "@/features/work_order/components/WorkOrderFormDialog";
import { useWorkOrders } from "@/features/work_order/hooks/useWorkOrders";

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
  const { data: trendData, loading: trendLoading, selected, selectMonth, monthOptions } = useMonthlyTrend();
  const { reload: reloadUsers } = useUsers();
  const { reload: reloadWorkOrders } = useWorkOrders();
  const [firstName, setFirstName] = useState<string>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [workOrderOpen, setWorkOrderOpen] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      const fullName = session?.user?.user_metadata?.full_name as string | undefined;
      setFirstName(fullName?.trim().split(/\s+/)[0]);
    });
    fetchProfile().then(setProfile).catch(() => {});
  }, []);

  const counts = data?.counts ?? null;

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Greeting */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-semibold tracking-tight">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening across KNUST's electrical assets and service requests.
        </p>
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
          <h3 className="font-semibold tracking-tight">Overview</h3>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            title="Total Users"
            img="/assets/images/dashboard/users.webp"
            count={counts?.userCount ?? null}
            loading={loading}
            to="/dashboard/users"
          />
          <InsightCard
            title="Total Work Orders"
            img="/assets/images/dashboard/work-orders.webp"
            count={counts?.workOrderCount ?? null}
            loading={loading}
            to="/dashboard/work-orders"
          />
          <InsightCard
            title="Total Requests"
            img="/assets/images/dashboard/service-requests.webp"
            count={counts?.requestCount ?? null}
            loading={loading}
            to="/dashboard/service-requests"
          />
          <InsightCard
            title="Total Assets"
            img="/assets/images/dashboard/assets.webp"
            count={counts?.assetCount ?? null}
            loading={loading}
            to="/dashboard/assets"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="font-semibold tracking-tight">Quick Actions</h3>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          <QuickActionCard
            title="Create Work Order"
            subtext="Submit and track new work orders"
            icon={Briefcase}
            color="#6EE7B7"
            titleColor="#059669"
            onClick={() => setWorkOrderOpen(true)}
          />
          <QuickActionCard
            title="New Asset"
            subtext="Register and catalog new equipment"
            icon={Boxes}
            to="/dashboard/assets"
            color="#FCD34D"
            titleColor="#D97706"
          />
          <QuickActionCard
            title="Add Someone"
            subtext="Onboard new team members to the system"
            icon={UserPlus}
            color="#C4B5FD"
            titleColor="#7C3AED"
            onClick={() => setInviteOpen(true)}
          />
        </div>
      </section>

      {profile && (profile.role === "admin" || profile.role === "manager") && (
        <InviteUserDialog
          userRole={profile.role}
          onInvited={reloadUsers}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      )}

      <RequestsTrendChart
        data={trendData}
        loading={trendLoading}
        selectedMonth={selected}
        monthOptions={monthOptions}
        onMonthChange={selectMonth}
      />

      <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
        <JobsStatus
          workOrdersByStatus={counts?.workOrdersByStatus ?? null}
          totalWorkOrders={counts?.workOrderCount ?? null}
          loading={loading}
        />
        <RecentActivity loading={loading} />
      </div>

      <WorkOrderFormDialog
        order={null}
        open={workOrderOpen}
        onOpenChange={setWorkOrderOpen}
        onSaved={reloadWorkOrders}
      />
    </div>
  );
}
