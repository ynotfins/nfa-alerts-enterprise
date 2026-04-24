"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { Profile } from "@/lib/db";
import { generateDeviceFingerprint } from "@/lib/fingerprint";
import {
  saveDeviceFingerprint,
  isDeviceBanned,
  checkUserStatus,
} from "@/services/moderation";

type AuthState = "loading" | "unauthenticated" | "authenticated" | "incomplete";

type AuthContextType = {
  user: User | null;
  profile: (Profile & { _id: string }) | null;
  state: AuthState;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  state: "loading",
  signOut: async () => {},
});

const PUBLIC_ROUTES = ["/login", "/signup"];
const SIGNUP_ROUTES = ["/signup/profile", "/signup/legal", "/signup/signature"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<(Profile & { _id: string }) | null>(
    null,
  );
  const [state, setState] = useState<AuthState>("loading");

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
    setState("unauthenticated");
    router.replace("/login");
  }, [router]);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setState("unauthenticated");
      }
    });
    return () => unsub();
  }, []);

  // Listen to profile when user exists
  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, "profiles", user.uid);

    const unsub = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setProfile({ _id: snap.id, ...data });
          setState(data.completedSteps >= 4 ? "authenticated" : "incomplete");
        } else {
          setProfile(null);
          setState("incomplete");
        }
      },
      (error) => {
        console.error("Profile listener error:", error);
        setProfile(null);
        setState("incomplete");
      },
    );

    return () => unsub();
  }, [user]);

  // Capture device fingerprint and check for device ban
  useEffect(() => {
    if (!user || state === "loading" || state === "unauthenticated") return;

    let mounted = true;

    const captureFingerprint = async () => {
      try {
        const fingerprint = await generateDeviceFingerprint();
        if (!fingerprint || !mounted) return;

        // Check if device is banned
        const deviceBanned = await isDeviceBanned(fingerprint);
        if (!mounted) return;

        if (deviceBanned) {
          await auth.signOut();
          router.replace("/banned");
          return;
        }

        // Save fingerprint to profile
        await saveDeviceFingerprint(fingerprint);
      } catch (err) {
        // Silent fail - fingerprint is not critical
        console.error("Fingerprint capture failed:", err);
      }
    };

    captureFingerprint();

    return () => {
      mounted = false;
    };
  }, [user, state, router]);

  // Handle redirects
  useEffect(() => {
    if (state === "loading") return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isSignupRoute = SIGNUP_ROUTES.some((r) => pathname.startsWith(r));
    const isProtectedRoute = !isPublicRoute && !isSignupRoute;

    if (state === "unauthenticated") {
      if (isProtectedRoute) {
        router.replace("/login");
      }
      return;
    }

    if (state === "incomplete") {
      if (!isSignupRoute && !isPublicRoute) {
        const step = profile?.completedSteps ?? 0;
        if (step < 1) router.replace("/signup/profile");
        else if (step < 2) router.replace("/signup/legal");
        else if (step < 4) router.replace("/signup/signature");
      }
      return;
    }

    if (state === "authenticated") {
      if (profile?.suspension?.active || profile?.ban?.active) {
        if (pathname !== "/suspended") {
          router.replace("/suspended");
        }
        return;
      }
      if (isPublicRoute || isSignupRoute) {
        router.replace("/incidents");
      }
    }
  }, [state, pathname, profile, router]);

  return (
    <AuthContext.Provider value={{ user, profile, state, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Backward compatibility
export function useAuthContext() {
  const { user, profile, state } = useContext(AuthContext);
  return {
    user,
    profile,
    loading: state === "loading",
    isAuthenticated: state === "authenticated",
  };
}
