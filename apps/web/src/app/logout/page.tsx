"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  useEffect(() => {
    const handleLogout = async () => {
      try {
        await authClient.signOut();
      } catch (error) {
        console.error("Sign out error:", error);
      }

      localStorage.clear();
      sessionStorage.clear();

      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "SIGN_OUT" });
      }

      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        } catch (e) {
          console.error("Cache delete error:", e);
        }
      }

      window.location.replace("/login");
    };

    handleLogout();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
}
