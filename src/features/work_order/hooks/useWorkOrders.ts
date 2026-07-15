import { useCallback, useEffect, useState } from "react";
import { fetchWorkOrders } from "@/features/work_order/services/work_order.service";
import type { WorkOrder } from "@/features/work_order/schema";

/**
 * Loads the work orders list. The web counterpart of the kced_mobile
 * `WorkOrdersController.load()`; `reload` replaces pull-to-refresh and is
 * also called after create/edit/delete.
 */
export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setWorkOrders(await fetchWorkOrders());
    } catch (e) {
      console.error("Work orders load failed:", e);
      setError("Could not load work orders. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { workOrders, loading, error, reload: load };
}
