import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from "@/features/user/schema";
import { updateUser } from "@/features/user/services/user.service";
import type { User } from "@/features/user/schema";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onSaved }: EditUserDialogProps) {
  const [role, setRole] = useState<UserRole>("technician");
  const [status, setStatus] = useState<UserStatus>("active");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && open) {
      setRole(user.role);
      setStatus(user.status);
    }
  }, [user, open]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUser(user.id, { role, status });
      toast.success(`Updated ${user.fullName || user.email}.`);
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>
          Change role or status for {user.fullName || user.email}.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as UserStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_STATUSES.map((s) => (
                  <SelectItem key={s.dbValue} value={s.dbValue}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
