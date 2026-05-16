"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTabsProps {
  children: ReactNode;
  connected?: boolean;
}

export function PageTabs({ children, connected = true }: PageTabsProps) {
  return (
    <div
      className="fixed left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-2 fade-in duration-300"
      style={{ bottom: connected ? 96 : 112 }}
    >
      <div
        className="border border-border/50 bg-card/80 backdrop-blur-xl p-1.5 shadow-sm transition-all duration-300 ease-in-out"
        style={{
          borderRadius: connected ? "1rem 1rem 0 0" : "1rem",
          borderBottom: connected ? "none" : undefined,
        }}
      >
        <div
          className="overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex gap-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface PageTabProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function PageTab({ active, onClick, children }: PageTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out",
        active
          ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
          : "text-muted-foreground hover:bg-accent/50 hover:scale-105 active:scale-95",
      )}
    >
      {children}
    </button>
  );
}
