/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Expand, Navigation } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface GoogleMapProps {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  className?: string;
  incidentLocation?: { lat: number; lng: number };
  nearbyIncidents?: Array<{
    _id: string;
    type: string;
    location: { lat: number; lng: number; address: string };
  }>;
  hasResponded?: boolean;
  isResponding?: boolean;
  onRespond?: () => void;
}

interface NearbyResource {
  name: string;
  type: string;
  location: { lat: number; lng: number };
  distance: number;
}

function DirectionsRenderer({
  origin,
  destination,
  onRouteCalculated,
}: {
  origin: { lat: number; lng: number };
  destination: string;
  onRouteCalculated: (distance: string, duration: string) => void;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");

  useEffect(() => {
    if (!map || !routesLibrary) return;

    const directionsService = new routesLibrary.DirectionsService();
    const directionsRenderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#4285F4",
        strokeWeight: 5,
      },
    });

    directionsService.route(
      {
        origin,
        destination,
        travelMode: "DRIVING" as any,
      },
      (result: any, status: any) => {
        if (status === "OK" && result) {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            onRouteCalculated(
              leg.distance?.text || "",
              leg.duration_in_traffic?.text || leg.duration?.text || "",
            );
          }
        } else {
          toast.error("Unable to calculate route");
        }
      },
    );

    return () => {
      directionsRenderer.setMap(null);
    };
  }, [map, routesLibrary, origin, destination, onRouteCalculated]);

  return null;
}

const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

function MapContent({
  fullAddress,
  userLocation,
  incidentLocation: propIncidentLocation,
  nearbyIncidents,
}: {
  fullAddress: string;
  userLocation: { lat: number; lng: number } | null;
  incidentLocation?: { lat: number; lng: number };
  nearbyIncidents?: Array<{
    _id: string;
    type: string;
    location: { lat: number; lng: number; address: string };
  }>;
}) {
  const map = useMap();
  const geocodingLibrary = useMapsLibrary("geocoding");
  const placesLibrary = useMapsLibrary("places");

  useEffect(() => {
    if (!GOOGLE_MAP_ID) {
      console.warn(
        "NEXT_PUBLIC_GOOGLE_MAP_ID is not set; using default map style",
      );
    }
  }, []);

  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [showTraffic, setShowTraffic] = useState(true);
  const [nearbyResources, setNearbyResources] = useState<NearbyResource[]>([]);
  const [incidentLocation, setIncidentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(propIncidentLocation || null);
  const center = incidentLocation || { lat: 25.7617, lng: -80.1918 };

  useEffect(() => {
    if (!map) return;

    if (showTraffic) {
      const trafficLayer = new (window as any).google.maps.TrafficLayer();
      trafficLayer.setMap(map);
      return () => trafficLayer.setMap(null);
    }
  }, [map, showTraffic]);

  useEffect(() => {
    if (propIncidentLocation) {
      // Use Promise.resolve to move setState into .then() callback
      Promise.resolve().then(() => {
        setIncidentLocation(propIncidentLocation);
      });
      return;
    }

    if (!geocodingLibrary) return;

    const geocoder = new geocodingLibrary.Geocoder();
    geocoder.geocode(
      { address: fullAddress },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (results: any, status: any) => {
        if (status === "OK" && results?.[0]) {
          const location = results[0].geometry.location;
          setIncidentLocation({ lat: location.lat(), lng: location.lng() });
        }
      }
    );
  }, [fullAddress, propIncidentLocation, geocodingLibrary]);

  useEffect(() => {
    if (!incidentLocation || !placesLibrary || !map) return;

    const service = new placesLibrary.PlacesService(map);

    const searchTypes = [
      { type: "fire_station", label: "Fire Station" },
      { type: "hospital", label: "Hospital" },
      { type: "police", label: "Police Station" },
    ];

    const resources: NearbyResource[] = [];

    Promise.all(
      searchTypes.map(
        ({ type, label }) =>
          new Promise<void>((resolve) => {
            service.nearbySearch(
              {
                location: incidentLocation,
                radius: 16000,
                type: type,
              },
              (results: any, status: any) => {
                if (status === "OK" && results) {
                  results.slice(0, 3).forEach((place: any) => {
                    if (place.geometry?.location) {
                      const loc = place.geometry.location;
                      const gMaps = (window as any).google.maps;
                      const latLng1 = new gMaps.LatLng(
                        incidentLocation.lat,
                        incidentLocation.lng,
                      );
                      const latLng2 = new gMaps.LatLng(loc.lat(), loc.lng());
                      const dist =
                        gMaps.geometry?.spherical?.computeDistanceBetween(
                          latLng1,
                          latLng2,
                        );
                      const distanceMiles = dist ? dist / 1609.34 : 0;

                      resources.push({
                        name: place.name || label,
                        type: label,
                        location: { lat: loc.lat(), lng: loc.lng() },
                        distance: Math.round(distanceMiles * 10) / 10,
                      });
                    }
                  });
                }
                resolve();
              },
            );
          }),
      ),
    ).then(() => {
      resources.sort((a, b) => a.distance - b.distance);
      setNearbyResources(resources);
    });
  }, [incidentLocation, placesLibrary, map]);

  const handleRouteCalculated = useCallback((dist: string, dur: string) => {
    setDistance(dist);
    setDuration(dur);
  }, []);

  const getMarkerColor = (type: string) => {
    const colors: Record<string, string> = {
      "Fire Station": "#ef4444",
      Hospital: "#3b82f6",
      "Police Station": "#8b5cf6",
      fire: "#f97316",
      flood: "#06b6d4",
      storm: "#6366f1",
      wind: "#84cc16",
      hail: "#a855f7",
      other: "#64748b",
    };
    return colors[type] || "#64748b";
  };

  return (
    <>
      <div
        className="relative flex-1 rounded-lg overflow-hidden border"
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={center}
          defaultZoom={showDirections ? 12 : 15}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId={GOOGLE_MAP_ID}
        >
          {showDirections && userLocation && (
            <DirectionsRenderer
              origin={userLocation}
              destination={fullAddress}
              onRouteCalculated={handleRouteCalculated}
            />
          )}

          {!showDirections && incidentLocation && (
            <AdvancedMarker position={incidentLocation}>
              <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </AdvancedMarker>
          )}

          {!showDirections &&
            nearbyResources.map((resource, i) => (
              <AdvancedMarker
                key={`resource-${i}`}
                position={resource.location}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: getMarkerColor(resource.type) }}
                  title={`${resource.name} (${resource.distance} mi)`}
                />
              </AdvancedMarker>
            ))}

          {!showDirections &&
            nearbyIncidents?.map((incident) => (
              <AdvancedMarker key={incident._id} position={incident.location}>
                <div
                  className="w-5 h-5 rounded-full border-2 border-white shadow-md opacity-60"
                  style={{ backgroundColor: getMarkerColor(incident.type) }}
                  title={incident.location.address}
                />
              </AdvancedMarker>
            ))}
        </Map>

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Button
            size="sm"
            variant={showTraffic ? "default" : "outline"}
            onClick={() => setShowTraffic(!showTraffic)}
            className="shadow-lg"
          >
            Traffic
          </Button>
        </div>
      </div>

      <div className="space-y-3 shrink-0">
        {nearbyIncidents && nearbyIncidents.length > 0 && (
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Nearby Incidents</p>
              <Badge variant="secondary">{nearbyIncidents.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active within 10 miles
            </p>
          </div>
        )}

        {nearbyResources.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Nearby Resources</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {nearbyResources.slice(0, 6).map((resource, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
                >
                  <span className="font-medium truncate flex-1">
                    {resource.name}
                  </span>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {resource.distance} mi
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {distance && duration && (
          <div className="flex items-center justify-between text-sm p-3 rounded-lg border bg-card">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Distance</span>
              <span className="font-medium">{distance}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">ETA</span>
              <span className="font-medium text-primary">{duration}</span>
            </div>
          </div>
        )}

        <Button
          onClick={() => setShowDirections(true)}
          className="w-full h-11"
          disabled={!userLocation}
        >
          <Navigation className="h-4 w-4 mr-2" />
          {showDirections ? "Recalculate Route" : "Get Directions"}
        </Button>
      </div>
    </>
  );
}

export function GoogleMap({
  address,
  city,
  state,
  zip,
  className,
  incidentLocation,
  nearbyIncidents,
  hasResponded,
  isResponding,
  onRespond,
}: GoogleMapProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const fullAddress = `${address}${city ? `, ${city}` : ""}${
    state ? `, ${state}` : ""
  }${zip ? ` ${zip}` : ""}`;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
        fullAddress,
      )}`
    : null;

  useEffect(() => {
    if ("geolocation" in navigator) {
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

  if (!apiKey) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-muted/50 border">
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Map preview unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="relative">
          <iframe
            src={embedUrl || undefined}
            className={`h-48 w-full rounded-lg border ${className || ""}`}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {onRespond && (
            <Button
              onClick={onRespond}
              disabled={hasResponded || isResponding}
              size="sm"
              className="absolute top-2 right-2 shadow-lg h-7 px-2 text-xs"
            >
              {isResponding ? "..." : hasResponded ? "✓" : "Respond"}
            </Button>
          )}
        </div>
        <Button
          onClick={() => setIsDrawerOpen(true)}
          variant="outline"
          className="w-full h-11"
        >
          <Expand className="h-4 w-4 mr-2" />
          Expand Map
        </Button>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Location & Directions</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 px-4 pb-4 flex flex-col gap-3">
            <MapContent
              fullAddress={fullAddress}
              userLocation={userLocation}
              incidentLocation={incidentLocation}
              nearbyIncidents={nearbyIncidents}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
