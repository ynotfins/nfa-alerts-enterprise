"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  HeartIcon,
  WarningIcon,
  ArrowsDownUpIcon,
  MagnifyingGlassIcon,
  XIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IncidentCard } from "@/components/incidents/incident-card";
import { IncidentFiltersDrawer } from "@/components/incidents/filters-drawer";
import { useIncidents } from "@/hooks/use-incidents";
import { useAuthContext } from "@/contexts/auth-context";
import { getAllUserIncidentFlags, IncidentFlags } from "@/services/incidents";
import { Skeleton } from "@/components/ui/skeleton";
import { Header, HeaderSkeleton, ContentSkeleton } from "@/components/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

type SortOption = "time" | "distance" | "alarm";

export default function IncidentsClient() {
  const { incidents, loading: incidentsLoading } = useIncidents();
  const { profile } = useAuthContext();

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [flagsMap, setFlagsMap] = useState<Map<string, IncidentFlags>>(
    new Map(),
  );

  const [filters, setFilters] = useState({
    types: [] as string[],
    alarmLevels: [] as string[],
    emergencyServices: [] as string[],
    hasResponder: null as boolean | null,
    states: [] as string[],
    cities: [] as string[],
    departments: [] as string[],
    distanceMiles: null as number | null,
    minUpdates: null as number | null,
  });

  const [sortBy, setSortBy] = useState<SortOption>("time");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {},
      );
    }
  }, []);

  useEffect(() => {
    getAllUserIncidentFlags().then(setFlagsMap);
  }, []);

  const availableFilters = useMemo(() => {
    const allDepartments = incidents
      .map((i) => i.departmentNumber)
      .filter((dept): dept is string[] => dept !== undefined)
      .flat()
      .filter((code): code is string => code !== undefined);
    const uniqueDepartments = [...new Set(allDepartments)];

    return {
      departments: uniqueDepartments,
    };
  }, [incidents]);

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

  const distanceCache = useMemo(() => {
    if (!userLocation) return new Map<string, number>();

    const cache = new Map<string, number>();
    incidents.forEach((incident) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        incident.location.lat,
        incident.location.lng,
      );
      cache.set(incident._id, distance);
    });
    return cache;
  }, [userLocation, incidents]);

  const getDistance = useCallback(
    (incidentId: string) => {
      return distanceCache.get(incidentId) ?? null;
    },
    [distanceCache],
  );

  const filteredIncidents = useMemo(() => {
    let filtered = [...incidents];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.location.address.toLowerCase().includes(query) ||
          i.location.city.toLowerCase().includes(query) ||
          i.location.state.toLowerCase().includes(query) ||
          i.location.county?.toLowerCase().includes(query) ||
          i.type.toLowerCase().includes(query) ||
          i.description?.toLowerCase().includes(query) ||
          i.displayId.toLowerCase().includes(query),
      );
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter((i) => filters.types.includes(i.type));
    }

    if (filters.alarmLevels.length > 0) {
      filtered = filtered.filter(
        (i) => i.alarmLevel && filters.alarmLevels.includes(i.alarmLevel),
      );
    }

    if (filters.emergencyServices.length > 0) {
      filtered = filtered.filter((i) => {
        if (!i.emergencyServicesStatus) return false;
        return filters.emergencyServices.includes(i.emergencyServicesStatus);
      });
    }

    if (filters.hasResponder !== null) {
      filtered = filtered.filter((i) =>
        filters.hasResponder
          ? i.responderIds && i.responderIds.length > 0
          : !i.responderIds || i.responderIds.length === 0,
      );
    }

    if (filters.states.length > 0) {
      filtered = filtered.filter((i) =>
        filters.states.includes(i.location.state),
      );
    }

    if (filters.cities.length > 0) {
      filtered = filtered.filter((i) =>
        filters.cities.includes(i.location.city),
      );
    }

    if (filters.departments.length > 0) {
      filtered = filtered.filter(
        (i) =>
          i.departmentNumber &&
          i.departmentNumber.some((dept) => filters.departments.includes(dept)),
      );
    }

    if (filters.distanceMiles !== null && userLocation) {
      filtered = filtered.filter((i) => {
        const distance = distanceCache.get(i._id);
        return distance !== undefined && distance <= filters.distanceMiles!;
      });
    }

    if (filters.minUpdates !== null) {
      filtered = filtered.filter((i) => {
        const count = (i as { activityCount?: number }).activityCount || 0;
        return count >= filters.minUpdates!;
      });
    }

    return filtered;
  }, [filters, incidents, userLocation, searchQuery, distanceCache]);

  const sortedIncidents = useMemo(() => {
    const alarmLevelOrder: Record<string, number> = {
      "5th_alarm": 5,
      "4th_alarm": 4,
      "3rd_alarm": 3,
      "2nd_alarm": 2,
      all_hands: 1,
    };

    const sorted = [...filteredIncidents];

    if (sortBy === "time") {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === "distance" && userLocation) {
      sorted.sort((a, b) => {
        const distA = distanceCache.get(a._id) ?? Infinity;
        const distB = distanceCache.get(b._id) ?? Infinity;
        return distA - distB;
      });
    } else if (sortBy === "alarm") {
      sorted.sort((a, b) => {
        const levelA = alarmLevelOrder[a.alarmLevel || ""] || 0;
        const levelB = alarmLevelOrder[b.alarmLevel || ""] || 0;
        return levelB - levelA;
      });
    }

    return sorted;
  }, [filteredIncidents, sortBy, userLocation, distanceCache]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    setRefreshing(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (contentRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPullingRef.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0 && contentRef.current?.scrollTop === 0) {
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      handleRefresh();
    }
    setPullDistance(0);
    isPullingRef.current = false;
  }, [pullDistance, handleRefresh]);

  const clearAllFilters = () => {
    setFilters({
      types: [],
      alarmLevels: [],
      emergencyServices: [],
      hasResponder: null,
      states: [],
      cities: [],
      departments: [],
      distanceMiles: null,
      minUpdates: null,
    });
  };

  const activeFilterCount =
    filters.types.length +
    filters.alarmLevels.length +
    filters.emergencyServices.length +
    (filters.hasResponder !== null ? 1 : 0) +
    filters.states.length +
    filters.cities.length +
    filters.departments.length +
    (filters.distanceMiles !== null ? 1 : 0) +
    (filters.minUpdates !== null ? 1 : 0);

  return (
    <div className="flex h-full flex-col">
      {incidentsLoading ? (
        <HeaderSkeleton hasActions />
      ) : showSearch ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground">
          <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, city, type..."
            className="flex-1 h-8 bg-white/10 border-0 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-white/10"
            onClick={() => {
              setShowSearch(false);
              setSearchQuery("");
            }}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Header
          title="Incidents"
          actions={
            <div className="flex items-center gap-1">
              <IncidentFiltersDrawer
                filters={filters}
                setFilters={setFilters}
                activeFilterCount={activeFilterCount}
                clearAllFilters={clearAllFilters}
                availableDepartments={availableFilters.departments}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-white/10"
                  >
                    <ArrowsDownUpIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortBy("time")}>
                    {sortBy === "time" && (
                      <CheckIcon className="h-4 w-4 mr-1" />
                    )}
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortBy("distance")}
                    disabled={!userLocation}
                  >
                    {sortBy === "distance" && (
                      <CheckIcon className="h-4 w-4 mr-1" />
                    )}
                    Nearest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("alarm")}>
                    {sortBy === "alarm" && (
                      <CheckIcon className="h-4 w-4 mr-1" />
                    )}
                    Alarm Level
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-white/10"
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </Button>
            </div>
          }
        />
      )}

      {incidentsLoading ? (
        <ContentSkeleton className="space-y-2 p-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </ContentSkeleton>
      ) : (
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {(pullDistance > 0 || refreshing) && (
            <div
              className="flex items-center justify-center overflow-hidden transition-all"
              style={{ height: refreshing ? 48 : pullDistance }}
            >
              <div
                className={`h-6 w-6 border-2 border-primary border-t-transparent rounded-full ${refreshing ? "animate-spin" : ""}`}
                style={{ opacity: refreshing ? 1 : pullDistance / 60 }}
              />
            </div>
          )}
          {sortedIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="rounded-full bg-muted p-4 mb-4 shadow-inner">
                <WarningIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {searchQuery
                  ? "No Search Results"
                  : activeFilterCount > 0
                    ? "No Matching Incidents"
                    : "No Incidents"}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {searchQuery
                  ? `No incidents found for "${searchQuery}"`
                  : activeFilterCount > 0
                    ? "No incidents match your current filters. Try adjusting your filter criteria."
                    : "There are no active incidents at this time"}
              </p>
              {(activeFilterCount > 0 || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearAllFilters();
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                  className="mt-4"
                >
                  {searchQuery ? "Clear Search" : "Clear Filters"}
                </Button>
              )}
            </div>
          ) : (
            sortedIncidents.map((incident) => (
              <IncidentCard
                key={incident._id}
                incident={incident}
                icon={HeartIcon}
                userRole={profile?.role}
                showActions
                userLocation={userLocation}
                cachedDistance={getDistance(incident._id)}
                initialFlags={flagsMap.get(incident._id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
