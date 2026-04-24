"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MagnifyingGlassIcon,
  MapIcon,
  ListBulletIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChasers } from "@/hooks/use-profiles";
import { useAuthContext } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import {
  Header,
  HeaderSkeleton,
  PageContent,
  ContentSkeleton,
} from "@/components/layout";

export default function ChasersClient() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const { chasers, loading } = useChasers();
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [minResponses, setMinResponses] = useState(0);
  const [minDaysActive, setMinDaysActive] = useState(0);
  const [locationTrackingOnly, setLocationTrackingOnly] = useState(false);
  const [selectedChaser, setSelectedChaser] = useState<string | null>(null);

  const isSupe = profile?.role === "supe" || profile?.role === "admin";
  const isLoading = loading || profile === undefined;

  const filteredChasers = chasers.filter((chaser) => {
    if (
      searchQuery &&
      !chaser.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (
      minResponses > 0 &&
      (chaser.stats?.alertsResponded || 0) < minResponses
    ) {
      return false;
    }
    if (minDaysActive > 0 && (chaser.stats?.daysActive || 0) < minDaysActive) {
      return false;
    }
    if (locationTrackingOnly && !chaser.locationTracking?.enabled) {
      return false;
    }
    return true;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setMinResponses(0);
    setMinDaysActive(0);
    setLocationTrackingOnly(false);
  };

  const chasersWithLocation = filteredChasers.filter(
    (c) => c.locationTracking?.lat && c.locationTracking?.lng,
  );

  const mapCenter =
    chasersWithLocation.length > 0
      ? {
          lat: chasersWithLocation[0].locationTracking!.lat!,
          lng: chasersWithLocation[0].locationTracking!.lng!,
        }
      : { lat: 25.7617, lng: -80.1918 };

  if (!isSupe && !isLoading) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Chasers" />
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <h2 className="text-lg font-semibold">Access Denied</h2>
            <p className="text-sm">Only supes can view chasers</p>
          </div>
        </div>
      </div>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-primary-foreground/10 rounded-md p-1">
        <Button
          variant={view === "list" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setView("list")}
        >
          <ListBulletIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={view === "map" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setView("map")}
        >
          <MapIcon className="h-4 w-4" />
        </Button>
      </div>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button variant="secondary" size="icon" className="h-8 w-8">
            <FunnelIcon className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Search & Filters</DrawerTitle>
            <DrawerDescription>
              Filter chasers by name, activity, and location tracking
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-6 space-y-6">
            <div>
              <Label htmlFor="search">Search by Name</Label>
              <div className="relative mt-2">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chasers..."
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div>
              <Label>Minimum Responses: {minResponses}</Label>
              <Slider
                value={[minResponses]}
                onValueChange={(v) => setMinResponses(v[0])}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Minimum Days Active: {minDaysActive}</Label>
              <Slider
                value={[minDaysActive]}
                onValueChange={(v) => setMinDaysActive(v[0])}
                max={365}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="location-tracking">
                Location Tracking Enabled Only
              </Label>
              <input
                id="location-tracking"
                type="checkbox"
                checked={locationTrackingOnly}
                onChange={(e) => setLocationTrackingOnly(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={() => setDrawerOpen(false)}>Apply Filters</Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {isLoading ? (
        <HeaderSkeleton hasActions />
      ) : (
        <Header title="Chasers" actions={headerActions} />
      )}

      {isLoading ? (
        <ContentSkeleton className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </ContentSkeleton>
      ) : (
        <PageContent className="flex-1 overflow-hidden">
          {view === "map" ? (
            chasersWithLocation.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <MapIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  No chasers with location tracking enabled
                </p>
              </div>
            ) : (
              <div className="w-full h-[90vh]">
                <Map
                  defaultCenter={mapCenter}
                  defaultZoom={10}
                  disableDefaultUI
                  zoomControl
                >
                  {chasersWithLocation.map((chaser) => (
                    <Marker
                      key={chaser._id}
                      position={{
                        lat: chaser.locationTracking!.lat!,
                        lng: chaser.locationTracking!.lng!,
                      }}
                      onClick={() => setSelectedChaser(chaser._id)}
                    />
                  ))}
                  {selectedChaser &&
                    (() => {
                      const chaser = chasersWithLocation.find(
                        (c) => c._id === selectedChaser,
                      );
                      if (!chaser) return null;
                      return (
                        <InfoWindow
                          position={{
                            lat: chaser.locationTracking!.lat!,
                            lng: chaser.locationTracking!.lng!,
                          }}
                          onCloseClick={() => setSelectedChaser(null)}
                        >
                          <div className="p-2">
                            <h3 className="font-bold mb-1">
                              {chaser.name || "Unknown"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {chaser.stats?.alertsResponded || 0} responses •{" "}
                              {chaser.stats?.daysActive || 0} days
                            </p>
                            <Button
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() =>
                                router.push(`/chasers/${chaser._id}`)
                              }
                            >
                              View Details
                            </Button>
                          </div>
                        </InfoWindow>
                      );
                    })()}
                </Map>
              </div>
            )
          ) : (
            <div className="overflow-y-auto h-full px-4">
              {filteredChasers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="rounded-full bg-muted p-4 mb-4 shadow-inner">
                    <ListBulletIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No chasers found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredChasers.map((chaser) => {
                    const hasActiveIncidents =
                      (chaser as { activeIncidents?: string[] }).activeIncidents
                        ?.length ?? 0 > 0;
                    const statusColor = hasActiveIncidents
                      ? "bg-orange-500"
                      : chaser.isOnline
                        ? "bg-green-500"
                        : "bg-gray-400";
                    const statusText = hasActiveIncidents
                      ? "Responding"
                      : chaser.isOnline
                        ? "Available"
                        : "Offline";

                    return (
                      <div
                        key={chaser._id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/chasers/${chaser._id}`)}
                      >
                        <Card className="hover:shadow-lg transition-all">
                          <CardContent className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12 shrink-0 shadow-sm">
                                <AvatarImage
                                  src={chaser.avatarUrl}
                                  alt={chaser.name || "Chaser"}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {chaser.name?.charAt(0).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${statusColor}`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {chaser.name || "Unknown"}
                                </h3>
                                <Badge
                                  variant={
                                    hasActiveIncidents ? "default" : "secondary"
                                  }
                                  className={`text-[10px] px-1.5 py-0 ${
                                    hasActiveIncidents ? "bg-orange-500" : ""
                                  }`}
                                >
                                  {statusText}
                                </Badge>
                              </div>
                              {chaser.stats ? (
                                <div className="flex gap-3 text-sm text-muted-foreground">
                                  <span>
                                    {chaser.stats.alertsResponded || 0}{" "}
                                    responses
                                  </span>
                                  <span>·</span>
                                  <span>
                                    {chaser.stats.daysActive || 0} days
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </PageContent>
      )}
    </div>
  );
}
