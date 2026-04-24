"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-7xl font-bold tracking-tight text-primary">
            Error
          </h1>
          <div className="space-y-2">
            <p className="text-xl font-medium">Something went wrong</p>
            <p className="text-base text-muted-foreground">
              {error.message ||
                "An error occurred while processing your request"}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono">
                {error.digest}
              </p>
            )}
          </div>
        </div>
        <Button onClick={reset} size="lg" className="h-12 px-8 text-base">
          Try again
        </Button>
      </div>
    </div>
  );
}
