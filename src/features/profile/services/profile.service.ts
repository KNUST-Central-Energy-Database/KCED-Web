import { supabase } from "@/lib/supabase";

/**
 * Profile read/update operations, mirroring the kced_mobile AuthController's
 * profile handling. Each throws `Error(message)` on failure so callers can
 * `try/catch → toast.error`.
 */

export type UserRole = "admin" | "manager" | "technician";
export type UserStatus = "invited" | "active" | "suspended";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  technician: "Technician",
};

/** The signed-in user's record from the `users` table (web AppUser). */
export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  avatarUrl: string | null;
  jurisdictionId: number | null;
  jurisdictionName: string | null;
  /** Year the auth account was created, for "Member since". */
  memberSinceYear: number | null;
}

/** Admins aren't tied to a jurisdiction — they show "Management" (mobile parity). */
export function jurisdictionLabel(profile: Profile): string {
  if (profile.role === "admin") return "Management";
  return profile.jurisdictionName ?? "Unassigned";
}

/** Load the signed-in user's profile row (plus jurisdiction name). */
export async function fetchProfile(): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You are not signed in.");

  const { data, error } = await supabase
    .from("users")
    .select("*, jurisdictions(name)")
    .eq("id", user.id)
    .single();
  if (error) throw new Error(error.message);

  const createdYear = user.created_at ? new Date(user.created_at).getFullYear() : null;
  return {
    id: data.id,
    fullName: data.full_name ?? "",
    email: data.email ?? user.email ?? "",
    role: (data.role as UserRole) ?? "technician",
    status: (data.status as UserStatus) ?? "active",
    phone: data.phone ?? null,
    avatarUrl: data.avatar_url ?? null,
    jurisdictionId: data.jurisdiction_id ?? null,
    jurisdictionName: (data.jurisdictions as { name: string } | null)?.name ?? null,
    memberSinceYear: Number.isNaN(createdYear) ? null : createdYear,
  };
}

/**
 * Save name/phone edits to the `users` table. Only writes fields that differ,
 * like the mobile `updateProfile`.
 */
export async function updateProfile(
  current: Profile,
  changes: { fullName?: string; phone?: string },
): Promise<void> {
  const updates: Record<string, string | null> = {};
  const newName = changes.fullName?.trim();
  const newPhone = changes.phone?.trim();

  if (newName !== undefined && newName !== current.fullName) updates.full_name = newName;
  if (newPhone !== undefined && newPhone !== (current.phone ?? "")) {
    updates.phone = newPhone === "" ? null : newPhone;
  }
  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase.from("users").update(updates).eq("id", current.id);
  if (error) throw new Error(error.message);

  // Keep auth metadata's full_name in sync — the top-bar greeting reads it.
  if (updates.full_name) {
    await supabase.auth.updateUser({ data: { full_name: updates.full_name } });
  }
}

/**
 * Change the password: re-verify identity with the current password (via a
 * sign-in, as in mobile), then set the new one.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("You are not signed in.");

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) throw new Error("Current password is incorrect.");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// ---- Email change (OTP flow) ------------------------------------------------
//
// Changing the login email happens entirely in-app via one-time codes,
// mirroring the kced_mobile AuthController. The steps, in order:
//   1. sendCurrentEmailOtp()  → code to the CURRENT email (proves ownership)
//   2. verifyCurrentEmailOtp()→ confirm that code
//   3. sendNewEmailOtp()      → code to the NEW email (Supabase "Secure email
//                               change" must be OFF so a single code goes to
//                               the new address)
//   4. verifyNewEmailOtp()    → confirm; the change applies immediately and
//                               the DB trigger mirrors it into users.email.

/** Step 1: email a 6-digit code to the current login email. */
export async function sendCurrentEmailOtp(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("You are not signed in.");

  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  });
  if (error) throw new Error(error.message);
}

/** Step 2: verify the code sent to the current email. */
export async function verifyCurrentEmailOtp(token: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("You are not signed in.");

  const { error } = await supabase.auth.verifyOtp({
    email: user.email,
    token: token.trim(),
    type: "email",
  });
  if (error) throw new Error(error.message || "Invalid code. Please try again.");
}

/** Step 3: request the change, emailing a code to the new address. */
export async function sendNewEmailOtp(newEmail: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("You are not signed in.");

  const target = newEmail.trim();
  if (!target) throw new Error("Enter a new email address.");
  if (target.toLowerCase() === user.email.toLowerCase()) {
    throw new Error("That is already your email.");
  }

  const { error } = await supabase.auth.updateUser({ email: target });
  if (error) throw new Error(error.message);
}

/** Step 4: verify the code sent to the new email; applies the change. */
export async function verifyNewEmailOtp(newEmail: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    email: newEmail.trim(),
    token: token.trim(),
    type: "email_change",
  });
  if (error) throw new Error(error.message || "Invalid code. Please try again.");
}
