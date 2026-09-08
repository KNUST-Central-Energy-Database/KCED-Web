import { useCallback, useEffect, useState } from "react";
import { fetchAssets } from "@/features/asset/services/asset.service";
import type { Asset } from "@/features/asset/schema";
import { useAuth } from "@/lib/auth-context";

/** Loads the assets list; `reload` refetches after external changes. */
export function useAssets() {
  const { role, jurisdictionId } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAssets(await fetchAssets(role, jurisdictionId));
    } catch (e) {
      console.error("Assets load failed:", e);
      setError("Could not load assets. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [role, jurisdictionId]);

  useEffect(() => {
    load();
  }, [load]);

  return { assets, loading, error, reload: load };
}
