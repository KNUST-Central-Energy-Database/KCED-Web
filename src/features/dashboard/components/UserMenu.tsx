import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { getSession, signOut } from "@/features/auth/services/auth.service";
import { supabase } from "@/lib/supabase";

interface Profile {
  id?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
}

/**
 * The signed-in user's avatar in the top bar. Click opens a menu with
 * Profile and Log out (click, not hover — hover menus don't work on touch
 * and close when the pointer drifts). Shows the profile picture when the
 * user has one, otherwise a Boring Avatar seeded by the user id — the web
 * counterpart of the mobile UserAvatar.
 */
export function UserMenu() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({});

  useEffect(() => {
    getSession().then(async (session) => {
      const user = session?.user;
      if (!user) return;
      // avatar_url lives on the profile row (as in kced_mobile's AppUser);
      // name comes from auth metadata, set during account setup.
      const { data } = await supabase
        .from("users")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();
      setProfile({
        id: user.id,
        fullName: (user.user_metadata?.full_name as string | undefined) ?? data?.full_name,
        email: user.email,
        avatarUrl: data?.avatar_url ?? undefined,
      });
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="ml-auto flex items-center rounded-full outline-none"
        aria-label="Account menu"
      >
        <UserAvatar seed={profile.id ?? "anonymous"} avatarUrl={profile.avatarUrl} size={36} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => navigate({ to: "/dashboard/profile" })}>
          <UserRound />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
