import { useCallback, useEffect, useState } from "react";
import {
  fetchDashboardCounts,
  type DashboardCounts,
} from "@/features/dashboard/services/dashboard.service";

export interface DashboardData {
  counts: DashboardCounts;
}

/**
 * Loads everything the dashboard shows in one parallel fetch. The web
 * counterpart of the kced_mobile `HomeController.load()`; `reload` replaces
 * the mobile pull-to-refresh.
 */
export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const counts = await fetchDashboardCounts();
      setData({ counts });
    } catch (e) {
      console.error("Dashboard load failed:", e);
      setError("Could not load insights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
