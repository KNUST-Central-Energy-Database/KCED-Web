import { MoreVertical, Shield, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";
import type { User } from "@/features/user/schema";
import { ROLE_LABELS } from "@/features/profile/services/profile.service";

interface UsersTableProps {
  users: User[];
}

/** "20 Jul 2026" */
function formatDate(iso: string | null): string {
  if (!iso) return "Unknown";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  manager: UserCog,
};

export function UsersTable({ users }: UsersTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-4xl border border-outline md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline bg-[#F9F9F9] text-center">
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Jurisdiction</th>
              <th className="px-4 py-2.5 font-medium">Phone</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="w-10 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const RoleIcon = ROLE_ICONS[user.role] ?? Shield;
              return (
                <tr
                  key={user.id}
                  className="border-b border-outline transition-colors last:border-b-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar seed={user.id} avatarUrl={user.avatarUrl} size={32} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{user.fullName || "Unnamed"}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <RoleIcon className="size-3.5" />
                      <span>{ROLE_LABELS[user.role] ?? user.role}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block whitespace-nowrap rounded-[6px] px-2 py-0.5 text-[11px] font-medium ${user.status === "active"
                          ? "bg-[#DDF0E4] text-[#0F4429]"
                          : user.status === "suspended"
                            ? "bg-[#FDECD2] text-[#8A5A00]"
                            : "bg-[#EDEDED] text-[#6B6B6B]"
                        }`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {user.role === "admin" ? "Management" : user.jurisdictionName ?? "Unassigned"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {user.phone ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-2 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreVertical className="size-4 text-muted-foreground" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserCog /> Edit role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="flex flex-col gap-2 md:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="overflow-hidden rounded-[10px] border border-outline"
          >
            <div className="flex flex-col gap-1 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <UserAvatar seed={user.id} avatarUrl={user.avatarUrl} size={28} />
                <p className="min-w-0 flex-1 truncate text-sm font-medium">
                  {user.fullName || "Unnamed"}
                </p>
                <span
                  className={`inline-block whitespace-nowrap rounded-[6px] px-2 py-0.5 text-[11px] font-medium ${user.status === "active"
                      ? "bg-[#DDF0E4] text-[#0F4429]"
                      : user.status === "suspended"
                        ? "bg-[#FDECD2] text-[#8A5A00]"
                        : "bg-[#EDEDED] text-[#6B6B6B]"
                    }`}
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-col gap-1 bg-[#F9F9F9] px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                {ROLE_LABELS[user.role] ?? user.role} ·{" "}
                {user.role === "admin" ? "Management" : user.jurisdictionName ?? "Unassigned"}
              </p>
              {user.phone && (
                <p className="text-xs text-muted-foreground">{user.phone}</p>
              )}
              <p className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
