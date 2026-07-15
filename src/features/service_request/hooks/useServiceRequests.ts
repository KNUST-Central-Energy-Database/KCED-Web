import { useCallback, useEffect, useState } from "react";
import { fetchServiceRequests } from "@/features/service_request/services/service_request.service";
import type { ServiceRequest } from "@/features/service_request/schema";

/**
 * Loads the service requests list. The web counterpart of the kced_mobile
 * `ServiceRequestsController.load()`; `reload` replaces pull-to-refresh and
 * is also called after a delete.
 */
export function useServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await fetchServiceRequests());
    } catch (e) {
      console.error("Service requests load failed:", e);
      setError("Could not load service requests. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { requests, loading, error, reload: load };
}
