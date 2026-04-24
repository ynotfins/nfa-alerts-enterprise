"use client";

import { useEffect } from "react";

export function useAppBadge(count: number) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateBadge = async () => {
      if ("setAppBadge" in navigator) {
        try {
          if (count > 0) {
            await navigator.setAppBadge(count);
          } else {
            await navigator.clearAppBadge();
          }
        } catch (error) {
          console.log("App badge not supported or failed:", error);
        }
      }
    };

    updateBadge();
  }, [count]);
}
