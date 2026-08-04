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
  { dbValue: "overdue", label: "Overdue" },
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

/** One day's service request count for the current-month trend chart. */
export interface DailyTrendPoint {
  day: string;
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
 * Service requests for a given month, bucketed by day.
 * Each entry has a formatted day label (e.g. "1 Jul") and the count.
 */
export async function fetchDailyRequestTrend(year: number, month: number): Promise<DailyTrendPoint[]> {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const { data, error } = await supabase
    .from("service_requests")
    .select("created_at")
    .gte("created_at", monthStart.toISOString())
    .lte("created_at", monthEnd.toISOString());
  if (error) throw error;

  const daysInMonth = monthEnd.getDate();
  const buckets = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return { day: label, count: 0 };
  });

  for (const row of data ?? []) {
    const dayIndex = new Date(row.created_at).getDate() - 1;
    if (dayIndex >= 0 && dayIndex < daysInMonth) {
      buckets[dayIndex].count++;
    }
  }

  return buckets;
}

export type ActivityEntityType = "service_request" | "work_order" | "asset" | "user";

export interface ActivityItem {
  id: string;
  entityType: ActivityEntityType;
  action: "created" | "status_changed";
  title: string;
  /** For status_changed: the new status. */
  detail: string | null;
  createdAt: string;
}

/**
 * Load the newest rows from `activity_log` for the dashboard feed. The table
 * is populated by DB triggers on service_requests / work_orders / assets /
 * users (see supabase/activity_log.sql), so events from the mobile app and
 * anonymous submissions show up too.
 */
export async function fetchRecentActivity(limit = 8): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, entity_type, entity_id, action, title, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    entityType: row.entity_type as ActivityEntityType,
    action: row.action as ActivityItem["action"],
    title: row.title ?? "",
    detail: row.detail ?? null,
    createdAt: row.created_at,
  }));
}
