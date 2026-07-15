import { supabase } from "@/lib/supabase";

/**
 * Dashboard insight queries, mirroring the kced_mobile `HomeController`.
 * Each throws on failure so callers can catch → show an error state.
 *
 * Unlike mobile (where managers/technicians see jurisdiction-scoped counts),
 * the web portal is admin-facing, so counts are global. Revisit if roles land
 * in the web app.
 */

/** Work order statuses, in display order. `dbValue` matches the DB rows. */
export const WORK_ORDER_STATUSES = [
  { dbValue: "pending", label: "Pending" },
  { dbValue: "en route", label: "En Route" },
  { dbValue: "in progress", label: "In Progress" },
  { dbValue: "completed", label: "Completed" },
] as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number]["dbValue"];

export interface DashboardCounts {
  userCount: number;
  workOrderCount: number;
  requestCount: number;
  assetCount: number;
  /** Work order count per status db value. */
  workOrdersByStatus: Record<WorkOrderStatus, number>;
}

/** A jurisdiction's slice of all work orders, sorted most-to-least. */
export interface JurisdictionShare {
  code: string;
  count: number;
  /** Share of all work orders, 0..1. */
  percent: number;
}

/** One week's service request count for the current-month trend chart. */
export interface WeeklyTrendPoint {
  week: string;
  count: number;
}

/**
 * Count rows in [table], optionally filtered to one work order status.
 * `head: true` keeps the payload empty — the count header still covers the
 * full result set (the web analogue of mobile's `limit(1).count(exact)`).
 */
async function countRows(table: string, status?: WorkOrderStatus): Promise<number> {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (status) query = query.eq("status", status);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/** Load the counts for the insight cards and the jobs status tiles. */
export async function fetchDashboardCounts(): Promise<DashboardCounts> {
  const [userCount, workOrderCount, requestCount, assetCount, ...statusCounts] =
    await Promise.all([
      countRows("users"),
      countRows("work_orders"),
      countRows("service_requests"),
      countRows("assets"),
      ...WORK_ORDER_STATUSES.map((s) => countRows("work_orders", s.dbValue)),
    ]);

  return {
    userCount,
    workOrderCount,
    requestCount,
    assetCount,
    workOrdersByStatus: Object.fromEntries(
      WORK_ORDER_STATUSES.map((s, i) => [s.dbValue, statusCounts[i]]),
    ) as Record<WorkOrderStatus, number>,
  };
}

/**
 * Work order counts per jurisdiction via an embedded count, sorted
 * most-to-least, with each share's percent of the total.
 */
export async function fetchJurisdictionShares(): Promise<JurisdictionShare[]> {
  const { data, error } = await supabase
    .from("jurisdictions")
    .select("code, work_orders(count)")
    .order("sort_order");
  if (error) throw error;

  const shares = (data ?? []).map((row) => ({
    code: row.code ?? "",
    count: (row.work_orders as { count: number }[])?.[0]?.count ?? 0,
  }));
  const total = shares.reduce((sum, s) => sum + s.count, 0);
  shares.sort((a, b) => b.count - a.count);

  return shares.map((s) => ({
    ...s,
    percent: total === 0 ? 0 : s.count / total,
  }));
}

/**
 * Service requests submitted this month, bucketed into weeks 1–4
 * (days 1–7, 8–14, 15–21, 22+). Mobile shows sample data here; the web
 * computes it from `created_at`.
 */
export async function fetchWeeklyRequestTrend(): Promise<WeeklyTrendPoint[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data, error } = await supabase
    .from("service_requests")
    .select("created_at")
    .gte("created_at", monthStart.toISOString());
  if (error) throw error;

  const buckets = [0, 0, 0, 0];
  for (const row of data ?? []) {
    const day = new Date(row.created_at).getDate();
    buckets[Math.min(Math.floor((day - 1) / 7), 3)]++;
  }

  return buckets.map((count, i) => ({ week: `Week ${i + 1}`, count }));
}
