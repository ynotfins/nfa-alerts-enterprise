"use client";

import { ReactNode } from "react";

interface FloatingContainerProps {
  children: ReactNode;
  position?: "bottom" | "top";
}

export function FloatingContainer({ children, position = "bottom" }: FloatingContainerProps) {
  return (
    <>
      <div className={`fixed ${position === "bottom" ? "bottom-0" : "top-0"} left-0 right-0 h-40 ${position === "bottom" ? "bg-linear-to-t" : "bg-linear-to-b"} from-background from-20% via-background/80 via-50% to-transparent pointer-events-none z-40`}></div>

      <div className={`fixed ${position === "bottom" ? "bottom-4 pb-safe" : "top-4"} inset-x-4 z-50`}>
        <div className="rounded-2xl border border-border/40 bg-background/70 backdrop-blur-xl shadow-lg">
          {children}
        </div>
      </div>
    </>
  );
}
