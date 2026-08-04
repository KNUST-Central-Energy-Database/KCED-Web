import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES, type UserRole } from "@/features/user/schema";
import { fetchJurisdictions } from "@/features/service_request/services/service_request.service";
import type { Jurisdiction } from "@/features/service_request/schema";
import { inviteUser } from "@/features/user/services/user.service";
import { toast } from "sonner";

interface InviteUserDialogProps {
  userRole: UserRole;
  onInvited: () => void;
  /** Controlled open state — when provided, the dialog is externally controlled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InviteUserDialog({ userRole, onInvited, open: externalOpen, onOpenChange }: InviteUserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("technician");
  const [jurisdictionId, setJurisdictionId] = useState<number | null>(null);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole === "admin";
  const needsJurisdiction = isAdmin && role !== "admin";

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setRole("technician");
    setJurisdictionId(null);
    setError(null);
    if (isAdmin && jurisdictions.length === 0) {
      fetchJurisdictions().then(setJurisdictions).catch(() => {});
    }
  }, [open, isAdmin, jurisdictions.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    if (needsJurisdiction && jurisdictionId === null) {
      setError("Please select a jurisdiction.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await inviteUser({
        email: trimmed,
        role: isAdmin ? role : undefined,
        jurisdictionId: needsJurisdiction ? jurisdictionId! : undefined,
      });
      toast.success(`Invitation sent to ${trimmed}.`);
      setOpen(false);
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the invite.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <UserPlus className="size-4" />
            Invite User
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogTitle>Invite User</DialogTitle>
        <DialogDescription>
          Send an email invitation to join the system.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          {isAdmin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.filter((r) => r.dbValue !== "admin").map((r) => (
                    <SelectItem key={r.dbValue} value={r.dbValue}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isAdmin && needsJurisdiction && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Jurisdiction</label>
              <Select
                value={jurisdictionId?.toString() ?? ""}
                onValueChange={(v) => setJurisdictionId(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map((j) => (
                    <SelectItem key={j.id} value={j.id.toString()}>
                      {j.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Sending…" : "Send Invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
