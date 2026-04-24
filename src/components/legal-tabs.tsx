"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function LegalTabs() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "terms";

  return (
    <div className="flex border-b bg-background">
      <Link
        href="/terms-privacy?tab=terms"
        className={cn(
          "flex-1 px-4 py-4 text-sm font-medium transition-colors",
          tab === "terms"
            ? "border-b-2 border-primary text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Terms of Service
      </Link>
      <Link
        href="/terms-privacy?tab=privacy"
        className={cn(
          "flex-1 px-4 py-4 text-sm font-medium transition-colors",
          tab === "privacy"
            ? "border-b-2 border-primary text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Privacy Policy
      </Link>
    </div>
  );
}
