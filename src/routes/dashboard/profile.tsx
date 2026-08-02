import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Calendar,
  ChevronRight,
  IdCard,
  LogOut,
  Mail,
  Pencil,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { signOut } from "@/features/auth/services/auth.service";
import { ChangeEmailDialog } from "@/features/profile/components/ChangeEmailDialog";
import { ChangePasswordDialog } from "@/features/profile/components/ChangePasswordDialog";
import { EditProfileDialog } from "@/features/profile/components/EditProfileDialog";
import {
  fetchProfile,
  jurisdictionLabel,
  ROLE_LABELS,
  type Profile,
} from "@/features/profile/services/profile.service";

// The `/dashboard` layout route (route.tsx) supplies the sidebar shell and the
// requireAuth guard; this is the profile page, ported from the kced_mobile
// My Account screen.
export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setProfile(await fetchProfile());
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  if (loading || !profile) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 pt-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-[80px] rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">View and manage your account details.</p>
      </div>

      {/* Identity card */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar seed={profile.id} avatarUrl={profile.avatarUrl} size={80} />
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-medium tracking-tight">
              {profile.fullName || "Unnamed User"}
            </h2>
            {profile.memberSinceYear && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-3.5" />
                Member since {profile.memberSinceYear}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <IdCard className="size-4" />
            {ROLE_LABELS[profile.role]}
          </span>
          <span className="flex items-center gap-2 font-medium text-primary">
            <Building2 className="size-4" />
            {jurisdictionLabel(profile)}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4" />
            {profile.email}
          </span>
          {profile.phone && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" />
              {profile.phone}
            </span>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-3.5" />
          Edit Profile
        </Button>
      </section>

      {/* Account section — email and password changes, as on mobile. */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
        <MenuTile label="Email" onClick={() => setEmailOpen(true)} />
        <MenuTile label="Password" onClick={() => setPasswordOpen(true)} />
      </section>

      <Button
        className="w-full bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA]"
        onClick={() => setLogoutOpen(true)}
        size="lg"
      >
        <LogOut className="size-4" />
        Log Out
      </Button>

      <EditProfileDialog
        profile={profile}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={load}
      />
      <ChangeEmailDialog
        currentEmail={profile.email}
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onChanged={load}
      />
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />

      {/* Log out confirmation — the web version of the mobile bottom sheet. */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="items-center text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#FEE2E2]">
            <LogOut className="size-5 text-[#DC2626]" />
          </span>
          <div className="flex flex-col gap-1">
            <DialogTitle>Log Out?</DialogTitle>
            <DialogDescription>
              You will be logged out of your account and will need to log in
              again to access the portal.
            </DialogDescription>
          </div>
          <div className="mt-2 grid w-full grid-cols-2 gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
              onClick={handleLogOut}
            >
              Log Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** A rounded menu row with a chevron, ported from the mobile menu tiles. */
function MenuTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-4xl border border-outline bg-background px-4 py-3 text-sm transition-colors hover:bg-muted"
    >
      {label}
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}
