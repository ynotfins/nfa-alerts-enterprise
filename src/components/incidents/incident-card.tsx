"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { capitalize, cn } from "@/lib/utils";
import {
  Icon,
  HeartIcon,
  BookmarkIcon,
  EyeSlashIcon,
  BellSlashIcon,
  UsersIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  toggleFavorite as toggleFavoriteService,
  toggleBookmark as toggleBookmarkService,
  toggleHide as toggleHideService,
  toggleMute as toggleMuteService,
  markViewed as markViewedService,
  getUserIncidentFlags,
  respondToIncident as respondToIncidentService,
} from "@/services/incidents";
import { toast } from "sonner";

const formatAlarmLevel = (level: string) => {
  const map: Record<string, string> = {
    all_hands: "All Hands",
    "2nd_alarm": "2nd Alarm",
    "3rd_alarm": "3rd Alarm",
    "4th_alarm": "4th Alarm",
    "5th_alarm": "5th Alarm",
  };
  return map[level] || level;
};

const getAlarmBadgeVariant = (
  level: string,
): "default" | "secondary" | "destructive" | "outline" => {
  if (level === "all_hands") return "default";
  if (level === "2nd_alarm") return "secondary";
  if (level === "3rd_alarm") return "destructive";
  if (level === "4th_alarm") return "destructive";
  if (level === "5th_alarm") return "destructive";
  return "default";
};

const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (miles: number) => {
  if (miles < 0.1) return "< 0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
};

export function IncidentCard({
  incident,
  icon: Icon,
  iconClassName,
  userRole,
  showActions = false,
  userLocation,
  cachedDistance,
  initialFlags,
}: {
  incident: {
    _id: string;
    type: string;
    description?: string;
    displayId: string;
    alarmLevel?: string;
    departmentNumber?: string[];
    location: {
      address: string;
      city: string;
      state: string;
      county?: string;
      lat: number;
      lng: number;
    };
    createdAt: number;
    activityCount?: number;
    responderCount?: number;
  };
  icon: Icon;
  iconClassName?: string;
  userRole?: "chaser" | "supe" | "admin";
  showActions?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  cachedDistance?: number | null;
  initialFlags?: {
    favorited: boolean;
    bookmarked: boolean;
    hidden: boolean;
    muted: boolean;
    viewed: boolean;
  };
}) {
  const date = new Date(incident.createdAt);

  const [flags, setFlags] = useState(
    initialFlags ?? {
      favorited: false,
      bookmarked: false,
      hidden: false,
      muted: false,
      viewed: false,
    },
  );

  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialFlags) {
      // Use Promise.resolve to move setState into .then() callback
      Promise.resolve().then(() => {
        setFlags(initialFlags);
      });
    } else {
      getUserIncidentFlags(incident._id).then(setFlags);
    }
  }, [incident._id, initialFlags]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - startXRef.current;
    setSwipeX(Math.max(-120, Math.min(120, diff)));
  };

  const handleTouchEnd = async () => {
    if (swipeX > 80) {
      try {
        await respondToIncidentService(incident._id);
        toast.success("Responded to incident");
      } catch (error) {
        console.error("Failed to respond to incident:", error);
        toast.error("Failed to respond");
      }
    } else if (swipeX < -80) {
      const result = await toggleFavoriteService(incident._id);
      setFlags((f) => ({ ...f, favorited: result.favorited ?? !f.favorited }));
      toast.success(
        result.favorited ? "Added to favorites" : "Removed from favorites",
      );
    }
    setSwipeX(0);
    setSwiping(false);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleFavoriteService(incident._id);
    setFlags((f) => ({ ...f, favorited: result.favorited ?? !f.favorited }));
  };

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleBookmarkService(incident._id);
    setFlags((f) => ({ ...f, bookmarked: result.bookmarked ?? !f.bookmarked }));
  };

  const handleToggleHide = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleHideService(incident._id);
    setFlags((f) => ({ ...f, hidden: result.hidden ?? !f.hidden }));
  };

  const handleToggleMute = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleMuteService(incident._id);
    setFlags((f) => ({ ...f, muted: result.muted ?? !f.muted }));
  };

  const activityCount = incident.activityCount || 0;
  const barCount = Math.min(activityCount, 5);

  const distance =
    cachedDistance !== undefined
      ? cachedDistance
      : userLocation
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            incident.location.lat,
            incident.location.lng,
          )
        : null;

  const handleClick = () => {
    if (!flags.viewed) {
      markViewedService(incident._id);
      setFlags((f) => ({ ...f, viewed: true }));
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 w-24 bg-green-500 flex items-center justify-center"
        style={{ opacity: swipeX > 0 ? Math.min(swipeX / 80, 1) : 0 }}
      >
        <CheckCircleIcon className="h-6 w-6 text-white" />
      </div>
      <div
        className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center"
        style={{ opacity: swipeX < 0 ? Math.min(-swipeX / 80, 1) : 0 }}
      >
        <HeartIcon className="h-6 w-6 text-white" />
      </div>
      <Link
        href={`/incidents/${incident._id}`}
        className="block"
        onClick={handleClick}
        data-tour="incident-card"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={cardRef}
          className="relative px-4 border-b py-2.5 transition-all bg-card hover:bg-accent/50"
          style={{
            transform: `translateX(${swipeX}px)`,
            transition: swiping ? "none" : "transform 0.2s ease-out",
          }}
        >
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 py-1" data-tour="activity-bars">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all duration-300",
                    i < barCount ? "bg-primary flex-1" : "bg-muted/50 flex-1",
                  )}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">
                    {format(date, "MM/dd/yyyy")} {format(date, "h:mm a")}
                  </span>
                  {incident.alarmLevel && (
                    <Badge
                      variant={getAlarmBadgeVariant(incident.alarmLevel)}
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {formatAlarmLevel(incident.alarmLevel)}
                    </Badge>
                  )}
                  {incident.responderCount !== undefined &&
                    incident.responderCount > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <UsersIcon className="size-3" />
                        {incident.responderCount}
                      </span>
                    )}
                </div>
                {showActions && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-accent"
                      onClick={handleToggleFavorite}
                      aria-label={
                        flags.favorited
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <HeartIcon
                        className={cn(
                          "size-3.5",
                          flags.favorited
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-accent"
                      onClick={handleToggleBookmark}
                      aria-label={
                        flags.bookmarked ? "Remove bookmark" : "Add bookmark"
                      }
                    >
                      <BookmarkIcon
                        className={cn(
                          "size-3.5",
                          flags.bookmarked
                            ? "fill-primary text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-accent"
                      onClick={handleToggleMute}
                      aria-label={
                        flags.muted ? "Unmute incident" : "Mute incident"
                      }
                    >
                      <BellSlashIcon
                        className={cn(
                          "size-3.5",
                          flags.muted
                            ? "text-orange-500"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-accent"
                      onClick={handleToggleHide}
                      aria-label={
                        flags.hidden ? "Unhide incident" : "Hide incident"
                      }
                    >
                      <EyeSlashIcon
                        className={cn(
                          "size-3.5",
                          flags.hidden
                            ? "text-blue-500"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                  </div>
                )}
                {!showActions && (
                  <Icon
                    className={
                      iconClassName || "size-5 text-muted-foreground shrink-0"
                    }
                  />
                )}
              </div>
              <p
                className={cn(
                  "text-sm leading-tight font-medium",
                  flags.viewed && "opacity-50",
                )}
              >
                {distance === null ? (
                  <span className="h-4 w-12 inline-block mr-1 bg-accent animate-pulse rounded-md" />
                ) : (
                  <span className="text-primary font-bold">
                    {formatDistance(distance)} ·{" "}
                  </span>
                )}
                {incident.location.state} |{" "}
                {incident.location.county && `${incident.location.county} | `}
                {incident.location.city} | {incident.location.address} |{" "}
                {capitalize(incident.type)} | {incident.description}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
