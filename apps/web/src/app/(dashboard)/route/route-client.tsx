"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Navigation,
  Car,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Route as RouteIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { App } from "@/components/app";
import { getRespondedIncidents } from "@/services/incidents";
import { Incident } from "@/lib/db";

type IncidentWithDistance = Incident & { _id: string; distance?: number };

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
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
}

function sortByNearest(
  incidents: IncidentWithDistance[],
  startLat: number,
  startLng: number
): IncidentWithDistance[] {
  if (incidents.length === 0) return [];

  const remaining = [...incidents];
  const sorted: IncidentWithDistance[] = [];
  let currentLat = startLat;
  let currentLng = startLng;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const inc = remaining[i];
      if (!inc.location?.lat || !inc.location?.lng) continue;
      const dist = calculateDistance(
        currentLat,
        currentLng,
        inc.location.lat,
        inc.location.lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = remaining.splice(nearestIdx, 1)[0];
    nearest.distance = nearestDist;
    sorted.push(nearest);

    if (nearest.location?.lat && nearest.location?.lng) {
      currentLat = nearest.location.lat;
      currentLng = nearest.location.lng;
    }
  }

  return sorted;
}

export default function RouteClient() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<IncidentWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [completedStops, setCompletedStops] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => setLocationError(true)
      );
    } else {
      setLocationError(true);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRespondedIncidents();
        setIncidents(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sortedIncidents = userLocation
    ? sortByNearest(
        incidents.filter((i) => !completedStops.has(i._id)),
        userLocation.lat,
        userLocation.lng
      )
    : incidents.filter((i) => !completedStops.has(i._id));

  const completedIncidents = incidents.filter((i) => completedStops.has(i._id));

  const toggleComplete = (id: string) => {
    setCompletedStops((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openInMaps = (incident: IncidentWithDistance) => {
    if (!incident.location?.lat || !incident.location?.lng) return;
    const url = `https://maps.google.com/maps?daddr=${incident.location.lat},${incident.location.lng}`;
    window.open(url, "_blank");
  };

  const openFullRoute = () => {
    if (!userLocation || sortedIncidents.length === 0) return;

    const waypoints = sortedIncidents
      .filter((i) => i.location?.lat && i.location?.lng)
      .map((i) => `${i.location!.lat},${i.location!.lng}`)
      .join("/");

    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${waypoints}`;
    window.open(url, "_blank");
  };

  const totalDistance = sortedIncidents.reduce(
    (sum, inc) => sum + (inc.distance || 0),
    0
  );

  return (
    <App
      title="Route Planner"
      back="/incidents"
      loading={loading}
      contentClassName="space-y-4"
    >
        {locationError && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Enable location for optimal routing
            </p>
          </div>
        )}

        {sortedIncidents.length === 0 && completedIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-lg border bg-card">
            <div className="bg-muted rounded-full p-4 mb-4">
              <RouteIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No Responded Incidents
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Respond to incidents first to plan your route
            </p>
            <Button onClick={() => router.push("/incidents")}>
              View Incidents
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div>
                <p className="text-xs text-muted-foreground">Total Stops</p>
                <p className="text-2xl font-bold">{sortedIncidents.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Distance</p>
                <p className="text-2xl font-bold">
                  {totalDistance.toFixed(1)} mi
                </p>
              </div>
              <Button
                onClick={openFullRoute}
                disabled={sortedIncidents.length === 0}
                className="gap-2"
              >
                <Navigation className="h-4 w-4" />
                Start
              </Button>
            </div>

            {sortedIncidents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium px-1">
                  Optimized Route ({sortedIncidents.length} stops)
                </h3>
                {sortedIncidents.map((incident, idx) => (
                  <div
                    key={incident._id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 flex items-center justify-center bg-primary text-primary-foreground font-bold text-sm rounded-full shrink-0">
                        {idx + 1}
                      </div>
                      {idx < sortedIncidents.length - 1 && (
                        <div className="w-0.5 h-6 bg-border mt-1" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="secondary" className="text-xs">
                          {incident.displayId || incident._id.slice(0, 8)}
                        </Badge>
                        {incident.distance !== undefined && (
                          <span className="text-xs text-primary font-medium">
                            {incident.distance.toFixed(1)} mi
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">
                        {incident.location?.address || "No address"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {incident.type}
                      </p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openInMaps(incident)}
                      >
                        <Car className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => toggleComplete(incident._id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() =>
                          router.push(`/incidents/${incident._id}`)
                        }
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {completedIncidents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium px-1">
                  Completed ({completedIncidents.length})
                </h3>
                {completedIncidents.map((incident) => (
                  <div
                    key={incident._id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 opacity-60"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 fill-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate line-through">
                        {incident.location?.address || "No address"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleComplete(incident._id)}
                    >
                      Undo
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
    </App>
  );
}
