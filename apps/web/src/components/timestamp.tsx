"use client";

import { useState, useEffect } from "react";

interface TimestampProps {
  date: string | Date;
  format?: "full" | "short" | "relative";
  className?: string;
}

// Helper function to get relative time - defined outside component to avoid hoisting issues
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function Timestamp({ date, format = "full", className }: TimestampProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [timezone, setTimezone] = useState<string>("");

  useEffect(() => {
    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Use Promise.resolve to move setState into .then() callback
    Promise.resolve().then(() => {
      setTimezone(userTimezone);

      if (format === "relative") {
        setFormattedDate(getRelativeTime(dateObj));
      } else if (format === "short") {
        setFormattedDate(
          dateObj.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: userTimezone,
          })
        );
      } else {
        setFormattedDate(
          dateObj.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: userTimezone,
          }).replace(",", " ·")
        );
      }
    });
  }, [date, format]);

  if (!formattedDate) {
    return <span className={className}>Loading...</span>;
  }

  return (
    <span className={className} title={`${timezone}`}>
      {formattedDate}
    </span>
  );
}
