import { supabase } from "@/lib/supabase";
import type { User, UserRole, UserStatus } from "@/features/user/schema";
import type { UserRole as ProfileUserRole } from "@/features/profile/services/profile.service";

/** Load users, newest first, with their jurisdiction name.
 *  Admins see all; managers/technicians see only their jurisdiction. */
export async function fetchUsers(
  role?: ProfileUserRole | null,
  jurisdictionId?: number | null,
): Promise<User[]> {
  const scoped = role && role !== "admin" && jurisdictionId != null;
  let query = supabase
    .from("users")
    .select("*, jurisdictions(name)");
  if (scoped) query = query.eq("jurisdiction_id", jurisdictionId!);
  const { data, error } = await query.order("created_at", { ascending: false });

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

/** Update a user's role and/or status. */
export async function updateUser(
  id: string,
  updates: { role?: UserRole; status?: UserStatus },
): Promise<void> {
  const payload: Record<string, string> = {};
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.status !== undefined) payload.status = updates.status;

  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase.from("users").update(payload).eq("id", id);
  if (error) throw new Error("Could not update user. Please try again.");
}

/** Invite a user by email via the Supabase Edge Function. */
export async function inviteUser(params: {
  email: string;
  role?: UserRole;
  jurisdictionId?: number;
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("You are not signed in.");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/invite-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      email: params.email.trim(),
      role: params.role ?? undefined,
      jurisdiction_id: params.jurisdictionId ?? undefined,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error ?? "Could not send the invite.");
  }
}
