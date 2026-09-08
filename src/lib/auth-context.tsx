import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchProfile, type Profile, type UserRole } from "@/features/profile/services/profile.service";

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  role: UserRole | null;
  jurisdictionId: number | null;
}

const AuthContext = createContext<AuthState>({
  profile: null,
  loading: true,
  role: null,
  jurisdictionId: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    profile: null,
    loading: true,
    role: null,
    jurisdictionId: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetchProfile()
      .then((profile) => {
        if (cancelled) return;
        setState({
          profile,
          loading: false,
          role: profile.role,
          jurisdictionId: profile.jurisdictionId,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ profile: null, loading: false, role: null, jurisdictionId: null });
      });

    return () => { cancelled = true; };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
