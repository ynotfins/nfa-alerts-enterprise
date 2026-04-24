"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface ContactCardProps {
  uid: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  distance?: number;
  lastMessage?: string;
  lastMessageAt?: Date;
  online?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  showDistance?: boolean;
  variant?: "default" | "compact";
}

export function ContactCard({
  name,
  email,
  avatarUrl,
  distance,
  lastMessage,
  lastMessageAt,
  onClick,
  disabled = false,
  showDistance = false,
  variant = "default",
}: ContactCardProps) {
  const isCompact = variant === "compact";
  const displayName = name || email;

  const content = (
    <Card>
      <CardContent className="flex items-center gap-4">
        <Avatar className={isCompact ? "h-11 w-11" : "h-12 w-12"}>
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback className={isCompact ? "text-sm" : "text-base"}>
            {displayName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p
              className={`font-semibold truncate ${
                isCompact ? "text-sm" : "text-base"
              }`}
            >
              {displayName}
            </p>
            {lastMessageAt && (
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(lastMessageAt, { addSuffix: true })}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {showDistance && distance !== undefined
              ? `${distance.toFixed(1)} km away`
              : lastMessage || email || "Start conversation"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left disabled:opacity-50"
      >
        {content}
      </button>
    );
  }

  return content;
}
