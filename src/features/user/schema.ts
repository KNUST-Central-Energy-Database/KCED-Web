export type UserRole = "admin" | "manager" | "technician";
export type UserStatus = "invited" | "active" | "suspended";

export const USER_ROLES: { dbValue: UserRole; label: string }[] = [
  { dbValue: "admin", label: "Admin" },
  { dbValue: "manager", label: "Manager" },
  { dbValue: "technician", label: "Technician" },
];

export const USER_STATUSES: { dbValue: UserStatus; label: string }[] = [
  { dbValue: "invited", label: "Invited" },
  { dbValue: "active", label: "Active" },
  { dbValue: "suspended", label: "Suspended" },
];

/** A row from the `users` table. */
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  avatarUrl: string | null;
  jurisdictionId: number | null;
  jurisdictionName: string | null;
  createdAt: string | null;
}
