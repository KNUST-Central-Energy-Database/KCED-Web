import { useCallback, useEffect, useState } from "react";
import { fetchUsers } from "@/features/user/services/user.service";
import type { User } from "@/features/user/schema";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await fetchUsers());
    } catch (e) {
      console.error("Users load failed:", e);
      setError("Could not load users. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { users, loading, error, reload: load };
}
