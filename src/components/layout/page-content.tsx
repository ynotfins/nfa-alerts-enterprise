"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ContentSkeletonProps {
  className?: string;
  children: ReactNode;
}

export function ContentSkeleton({ className, children }: ContentSkeletonProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto animate-in fade-in duration-200", className)}>
      {children}
    </div>
  );
}
