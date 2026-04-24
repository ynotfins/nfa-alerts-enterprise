import { useAuth } from "@/contexts/auth-context";

export function useRole() {
  const { profile, state } = useAuth();
  const loading = state === "loading";

  const isSupe = profile?.role === "supe" || profile?.role === "admin";
  const isChaser = profile?.role === "chaser";
  const isAdmin = profile?.role === "admin";

  return {
    profile,
    loading,
    isSupe,
    isChaser,
    isAdmin,
    role: profile?.role,
  };
}
