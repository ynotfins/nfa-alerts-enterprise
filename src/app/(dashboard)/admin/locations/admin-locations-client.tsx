"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPinIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAllProfiles } from "@/hooks/use-profiles";
import { Header } from "@/components/layout";

// Helper function to format last update time - defined outside component
function formatLastUpdate(timestamp?: number): string {
  if (!timestamp) return "Unknown";
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type TrackedProfile = {
  _id: string;
  name?: string;
  avatarUrl?: string;
  role: "chaser" | "supe" | "admin";
  locationTracking?: {
    enabled: boolean;
    lastUpdate?: number;
    accuracy?: number;
    lat?: number;
    lng?: number;
  };
};

export default function AdminLocationsClient() {
  const { profiles, loading } = useAllProfiles();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [listExpanded, setListExpanded] = useState(true);

  const locations = profiles as TrackedProfile[];

  const trackedProfiles = locations.filter(
    (profile) =>
      profile.locationTracking?.enabled &&
      profile.locationTracking?.lat &&
      profile.locationTracking?.lng,
  );

  const center =
    trackedProfiles.length > 0 &&
    trackedProfiles[0].locationTracking?.lat &&
    trackedProfiles[0].locationTracking?.lng
      ? {
          lat: trackedProfiles[0].locationTracking.lat,
          lng: trackedProfiles[0].locationTracking.lng,
        }
      : { lat: 25.7617, lng: -80.1918 };

  const selectedCenter = selectedProfile
    ? trackedProfiles.find((p) => p._id === selectedProfile)?.locationTracking
    : null;

  const getMarkerColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#ef4444";
      case "supe":
        return "#22c55e";
      case "chaser":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            Admin
          </Badge>
        );
      case "supe":
        return (
          <Badge variant="default" className="text-[10px] px-1.5 py-0">
            Supe
          </Badge>
        );
      case "chaser":
        return (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Chaser
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Live Locations"
        actions={
          <Badge variant="secondary" className="bg-white/20 text-white">
            {trackedProfiles.length} tracked
          </Badge>
        }
      />

      <div className="flex-1 relative">
        {trackedProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="rounded-full bg-muted p-4 mb-4 shadow-inner">
              <MapPinIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Active Tracking</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              No users have location tracking enabled
            </p>
          </div>
        ) : (
          <>
            <Map
              center={
                selectedCenter?.lat && selectedCenter?.lng
                  ? { lat: selectedCenter.lat, lng: selectedCenter.lng }
                  : center
              }
              defaultZoom={11}
              mapId={
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID"
              }
              disableDefaultUI={false}
              className="w-full h-full"
            >
              {trackedProfiles.map((profile) => {
                if (
                  !profile.locationTracking?.lat ||
                  !profile.locationTracking?.lng
                )
                  return null;
                const isSelected = selectedProfile === profile._id;
                return (
                  <AdvancedMarker
                    key={profile._id}
                    position={{
                      lat: profile.locationTracking.lat,
                      lng: profile.locationTracking.lng,
                    }}
                    onClick={() =>
                      setSelectedProfile(isSelected ? null : profile._id)
                    }
                  >
                    <div
                      className={cn(
                        "rounded-full border-2 shadow-lg flex items-center justify-center text-white font-bold transition-all",
                        isSelected
                          ? "w-12 h-12 border-white ring-2 ring-primary"
                          : "w-10 h-10 border-white",
                      )}
                      style={{
                        backgroundColor: getMarkerColor(profile.role),
                      }}
                    >
                      {profile.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </AdvancedMarker>
                );
              })}
            </Map>

            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-background border-t shadow-lg transition-all",
                listExpanded ? "h-48" : "h-12",
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-10 rounded-none border-b flex items-center justify-center gap-2"
                onClick={() => setListExpanded(!listExpanded)}
              >
                {listExpanded ? (
                  <>
                    <ChevronDownIcon className="h-4 w-4" />
                    <span className="text-xs">Hide List</span>
                  </>
                ) : (
                  <>
                    <ChevronUpIcon className="h-4 w-4" />
                    <span className="text-xs">
                      Show List ({trackedProfiles.length})
                    </span>
                  </>
                )}
              </Button>

              {listExpanded && (
                <div className="overflow-y-auto h-[calc(100%-40px)]">
                  {trackedProfiles.map((profile) => {
                    const isSelected = selectedProfile === profile._id;
                    return (
                      <div
                        key={profile._id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 border-b cursor-pointer transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-accent/50",
                        )}
                        onClick={() =>
                          setSelectedProfile(isSelected ? null : profile._id)
                        }
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          {profile.avatarUrl && (
                            <AvatarImage src={profile.avatarUrl} />
                          )}
                          <AvatarFallback
                            className="text-white text-sm"
                            style={{
                              backgroundColor: getMarkerColor(profile.role),
                            }}
                          >
                            {profile.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {profile.name || "Unknown"}
                            </span>
                            {getRoleBadge(profile.role)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Updated{" "}
                            {formatLastUpdate(
                              profile.locationTracking?.lastUpdate,
                            )}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
