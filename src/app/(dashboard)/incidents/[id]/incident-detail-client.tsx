"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  HeartIcon as HeartOutline,
  BookmarkIcon as BookmarkOutline,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
} from "@heroicons/react/24/solid";
import {
  EyeSlashIcon,
  BellSlashIcon,
  ShieldIcon,
  XIcon,
  CheckCircleIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Timestamp } from "@/components/timestamp";
import { GoogleMap } from "@/components/google-map";
import { WeatherHeatmap } from "@/components/weather/weather-heatmap";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";
import { Incident } from "@/lib/db";
import {
  useIncident,
  useIncidentNotes,
  useIncidentActivities,
  useIncidentResponders,
} from "@/hooks/use-incidents";
import { useAuthContext } from "@/contexts/auth-context";

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

function IncidentDetail({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [silentEdit, setSilentEdit] = useState(false);
  const [weather, setWeather] = useState<{
    temperature: number;
    temperatureUnit: string;
    shortForecast: string;
    icon?: string;
    windSpeed: string;
    windDirection: string;
    detailedForecast?: string;
    forecast?: Array<{
      name: string;
      temperature: number;
      temperatureUnit: string;
      isDaytime: boolean;
      shortForecast: string;
      windSpeed: string;
      probabilityOfPrecipitation: number;
    }>;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const { profile } = useAuthContext();
  const {
    incident,
    flags,
    respondToIncident: respondToIncidentService,
    addNote: addNoteService,
    toggleFavorite: toggleFavoriteService,
    toggleBookmark: toggleBookmarkService,
    toggleHide: toggleHideService,
    toggleMute: toggleMuteService,
    awardSecured: awardSecuredService,
    removeSecured: removeSecuredService,
    closeIncident: closeIncidentService,
    reopenIncident: reopenIncidentService,
    removeResponder: removeResponderService,
  } = useIncident(incidentId);

  const { notes, refresh: refreshNotes } = useIncidentNotes(incidentId);
  const { activities: incidentActivities } =
    useIncidentActivities(incidentId);
  const { responders } = useIncidentResponders(incident?.responderIds);

  const [isResponding, setIsResponding] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const nearbyIncidents: (Incident & { _id: string })[] = [];
  const isFavorited = flags.favorited;
  const isBookmarked = flags.bookmarked;
  const isHidden = flags.hidden;
  const isMuted = flags.muted;

  const hasResponded =
    profile?._id && incident?.responderIds?.includes(profile._id);

  const handleRespond = async () => {
    setIsResponding(true);
    try {
      await respondToIncidentService();
      toast.success("You're now responding to this incident");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to respond");
    } finally {
      setIsResponding(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSavingNote(true);
    try {
      await addNoteService(newComment.trim());
      setNewComment("");
      setSilentEdit(false);
      toast.success("Note saved");
      await refreshNotes();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save note",
      );
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavoriteService();
  };

  const handleToggleBookmark = async () => {
    await toggleBookmarkService();
  };

  const handleToggleHide = async () => {
    await toggleHideService();
  };

  const handleToggleMute = async () => {
    await toggleMuteService();
  };

  const isSupe = profile?.role === "supe" || profile?.role === "admin";

  const handleAwardSecured = async (chaserId: string) => {
    try {
      await awardSecuredService(chaserId);
      toast.success("Job assigned");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign job",
      );
    }
  };

  const handleRemoveSecured = async () => {
    try {
      await removeSecuredService();
      toast.success("Job unassigned");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unassign job",
      );
    }
  };

  const handleCloseIncident = async () => {
    try {
      await closeIncidentService();
      toast.success("Incident closed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to close incident",
      );
    }
  };

  const handleReopenIncident = async () => {
    try {
      await reopenIncidentService();
      toast.success("Incident reopened");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reopen incident",
      );
    }
  };

  const handleRemoveResponder = async (responderId: string) => {
    try {
      await removeResponderService(responderId);
      toast.success("Responder removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove responder",
      );
    }
  };

  useEffect(() => {
    if (!incident?.location) return;

    let cancelled = false;

    const loadWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch(
          `/api/weather?lat=${incident.location.lat}&lng=${incident.location.lng}`,
        );
        const data = await res.json();
        if (!cancelled && !data.error) {
          setWeather(data);
        }
      } catch {
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    };

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, [incident?.location]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (newComment.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [newComment]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && newComment.trim()) {
        const href = link.getAttribute("href");
        if (href && !href.startsWith(`/incidents/${incidentId}`)) {
          e.preventDefault();
          const confirmed = window.confirm(
            "You have unsaved notes. Are you sure you want to leave?",
          );
          if (confirmed) {
            router.push(href);
            setNewComment("");
          }
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [newComment, router, incidentId]);

  if (!incident) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Incident not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card data-tour="incident-map">
        <CardHeader>
          <CardTitle>Location & Map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleMap
            address={incident.location.address}
            city={incident.location.city}
            state={incident.location.state}
            zip=""
            incidentLocation={{
              lat: incident.location.lat,
              lng: incident.location.lng,
            }}
            nearbyIncidents={nearbyIncidents}
            hasResponded={!!hasResponded}
            isResponding={isResponding}
            onRespond={handleRespond}
          />
        </CardContent>
      </Card>

      <Card data-tour="incident-info">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl">
                  {capitalize(incident.type)}
                </CardTitle>
                {incident.status === "closed" && (
                  <Badge
                    variant="outline"
                    className="border-muted-foreground text-muted-foreground"
                  >
                    Closed
                  </Badge>
                )}
                {incident.alarmLevel && (
                  <Badge variant={getAlarmBadgeVariant(incident.alarmLevel)}>
                    {formatAlarmLevel(incident.alarmLevel)}
                  </Badge>
                )}
                {incident.securedById && (
                  <Badge variant="default" className="bg-green-600">
                    <ShieldIcon className="h-3 w-3 mr-1" />
                    Assigned
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium">{incident.displayId}</span>
                {(profile?.role === "supe" || profile?.role === "admin") &&
                  incident.departmentNumber &&
                  incident.departmentNumber.length > 0 && (
                    <span>FD: {incident.departmentNumber.join(", ")}</span>
                  )}
              </div>
            </div>
            <div
              className="flex items-center gap-0.5 shrink-0"
              data-tour="incident-actions"
            >
              <button
                onClick={handleToggleFavorite}
                className="rounded-full p-2 hover:bg-accent transition-colors"
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
              >
                {isFavorited ? (
                  <HeartSolid className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartOutline className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={handleToggleBookmark}
                className="rounded-full p-2 hover:bg-accent transition-colors"
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                {isBookmarked ? (
                  <BookmarkSolid className="h-5 w-5 text-primary" />
                ) : (
                  <BookmarkOutline className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={handleToggleMute}
                className="rounded-full p-2 hover:bg-accent transition-colors"
                aria-label={isMuted ? "Unmute incident" : "Mute incident"}
              >
                <BellSlashIcon
                  className={`h-5 w-5 ${
                    isMuted ? "text-orange-500" : "text-muted-foreground"
                  }`}
                />
              </button>
              <button
                onClick={handleToggleHide}
                className="rounded-full p-2 hover:bg-accent transition-colors"
                aria-label={isHidden ? "Unhide incident" : "Hide incident"}
              >
                <EyeSlashIcon
                  className={`h-5 w-5 ${
                    isHidden ? "text-destructive" : "text-muted-foreground"
                  }`}
                />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Type
              </p>
              <Badge>{capitalize(incident.type)}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Reported
              </p>
              <Timestamp
                date={new Date(incident.createdAt)}
                className="text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Location
            </p>
            <p className="font-medium">{incident.location.address}</p>
            <p className="text-sm text-muted-foreground">
              {incident.location.city}
              {incident.location.county &&
                `, ${incident.location.county} County`}
              , {incident.location.state}
            </p>
          </div>

          {incident.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm leading-relaxed">{incident.description}</p>
            </div>
          )}

          <Button
            onClick={handleRespond}
            disabled={hasResponded || isResponding}
            className="w-full h-11"
            data-tour="respond-button"
          >
            {isResponding
              ? "Responding..."
              : hasResponded
                ? "Already Responded"
                : "Respond to Incident"}
          </Button>
        </CardContent>
      </Card>

      {responders && responders.length > 0 && (
        <Card data-tour="responders-card">
          <CardHeader>
            <CardTitle>
              {responders.length === 1
                ? "Responder"
                : `Responders (${responders.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {responders.map((responder) => {
                const isSecured = incident.securedById === responder._id;
                return (
                  <div key={responder._id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {responder.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={responder.avatarUrl}
                            alt={responder.name || "Responder"}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            {(responder.name || "?").charAt(0).toUpperCase()}
                          </span>
                        )}
                        {isSecured && (
                          <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-0.5">
                            <ShieldIcon className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {responder.name || "Unknown"}
                          </p>
                          {isSecured && (
                            <Badge
                              variant="default"
                              className="bg-green-600 text-xs px-1.5 py-0 shrink-0"
                            >
                              Assigned
                            </Badge>
                          )}
                        </div>
                        {incident.respondedAt && (
                          <p className="text-xs text-muted-foreground">
                            Responded{" "}
                            <Timestamp
                              date={new Date(incident.respondedAt)}
                              format="relative"
                            />
                          </p>
                        )}
                      </div>
                    </div>
                    {isSupe && (
                      <div className="flex gap-2 pl-15">
                        {!isSecured && !incident.securedById && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleAwardSecured(responder._id)}
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                            Assign Job
                          </Button>
                        )}
                        {isSecured && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleRemoveSecured}
                          >
                            <XIcon className="h-4 w-4 mr-1.5" />
                            Unassign Job
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveResponder(responder._id)}
                        >
                          <XIcon className="h-4 w-4 mr-1.5" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isSupe && (
        <Card data-tour="supe-actions">
          <CardHeader>
            <CardTitle>Supe Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incident.status !== "closed" ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleCloseIncident}
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Close Incident
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleReopenIncident}
              >
                <ArrowClockwiseIcon className="h-4 w-4 mr-2" />
                Reopen Incident
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="space-y-2">
            <div className="border-b pb-2">
              <div className="text-xs font-bold mb-0.5">
                {format(new Date(incident.createdAt), "MM/dd/yyyy")}{" "}
                {format(new Date(incident.createdAt), "h:mm a")}
              </div>
              <p className="text-sm leading-snug">
                {capitalize(incident.type)} | {incident.description}
              </p>
            </div>
            {incidentActivities.map((activity) => {
              const activityDate = new Date(activity.createdAt);
              return (
                <div
                  key={activity._id}
                  className="border-b pb-2 last:border-b-0"
                >
                  <div className="text-xs font-bold mb-0.5">
                    {format(activityDate, "MM/dd/yyyy")}{" "}
                    {format(activityDate, "h:mm a")}
                  </div>
                  <p className="text-sm leading-snug">
                    {capitalize(activity.type.replace(/_/g, " "))} |{" "}
                    {activity.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {weather && (
        <Card>
          <CardHeader>
            <CardTitle>Live Weather</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {weather.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={weather.icon}
                    alt={weather.shortForecast}
                    className="w-16 h-16"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold">
                      {weather.temperature}°{weather.temperatureUnit}
                    </p>
                  </div>
                  <p className="text-lg font-medium mt-1">
                    {weather.shortForecast}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Wind Speed
                  </p>
                  <p className="font-medium">{weather.windSpeed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Wind Direction
                  </p>
                  <p className="font-medium">{weather.windDirection}</p>
                </div>
              </div>

              {weather.forecast && weather.forecast.length > 0 && (
                <div className="pt-2 border-t">
                  <WeatherHeatmap forecast={weather.forecast} />
                </div>
              )}

              {weather.detailedForecast && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    {weather.detailedForecast}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {weatherLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Live Weather</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded" />
                  ))}
                </div>
                <Skeleton className="h-3 w-full" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notes ({notes.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {notes.length > 0 && (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note._id} className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">User</p>
                      <span className="text-muted-foreground">·</span>
                      <Timestamp
                        date={new Date(note.createdAt)}
                        format="relative"
                        className="text-xs text-muted-foreground"
                      />
                    </div>
                    <p className="text-sm leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            )}

            {notes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notes yet. Be the first to add one!
              </p>
            )}

            <div className="pt-2 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a note..."
                className="min-h-20 resize-none"
              />
              {newComment.trim() && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Unsaved note - save before leaving page
                </p>
              )}
              {profile?.role === "admin" && (
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id="silentEditNote"
                    checked={silentEdit}
                    onCheckedChange={(checked) =>
                      setSilentEdit(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="silentEditNote"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Silent Edit (no activity log)
                  </Label>
                </div>
              )}
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSavingNote}
                className="w-full h-11"
              >
                {isSavingNote ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function IncidentDetailClient({
  incidentId,
}: {
  incidentId: string;
}) {
  return <IncidentDetail incidentId={incidentId} />;
}
