import { supabase } from "@/lib/supabase";
import type { User } from "@/features/user/schema";

/** Load all users, newest first, with their jurisdiction name. */
export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*, jurisdictions(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const jurisdiction = row.jurisdictions ?? null;
    return {
      id: row.id,
      fullName: row.full_name ?? "",
      email: row.email ?? "",
      role: (row.role as User["role"]) ?? "technician",
      status: (row.status as User["status"]) ?? "active",
      phone: row.phone ?? null,
      avatarUrl: row.avatar_url ?? null,
      jurisdictionId: row.jurisdiction_id ?? null,
      jurisdictionName: jurisdiction?.name ?? null,
      createdAt: row.created_at ?? null,
    };
  });
}
