"use client";

import { useState, useEffect } from "react";
import {
  HeartIcon,
  ChatCircleIcon,
  UserCheckIcon,
  BookmarkIcon,
  NoteIcon,
} from "@phosphor-icons/react";
import { IncidentCard } from "@/components/incidents/incident-card";
import { useAuthContext } from "@/contexts/auth-context";
import {
  getFavorites,
  getBookmarks,
  getRespondedIncidents,
  getIncidentsWithNotes,
} from "@/services/incidents";
import {
  Header,
  HeaderSkeleton,
  PageContent,
  ContentSkeleton,
  PageTabs,
  PageTab,
} from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Incident } from "@/lib/db";

export default function FavoritesClient() {
  const { profile } = useAuthContext();
  const [favoriteIncidents, setFavoriteIncidents] = useState<
    (Incident & { _id: string })[]
  >([]);
  const [bookmarkedIncidents, setBookmarkedIncidents] = useState<
    (Incident & { _id: string })[]
  >([]);
  const [respondedIncidents, setRespondedIncidents] = useState<
    (Incident & { _id: string })[]
  >([]);
  const [notesIncidents, setNotesIncidents] = useState<
    (Incident & { _id: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "favorite" | "bookmarks" | "responded" | "notes"
  >("favorite");

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [favorites, bookmarks, responded, notes] = await Promise.all([
          getFavorites().catch(() => []),
          getBookmarks().catch(() => []),
          getRespondedIncidents().catch(() => []),
          getIncidentsWithNotes().catch(() => []),
        ]);

        if (!mounted) return;

        setFavoriteIncidents(favorites);
        setBookmarkedIncidents(bookmarks);
        setRespondedIncidents(responded);
        setNotesIncidents(notes);
      } catch (error) {
        console.error("Failed to load favorites data:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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

  const EmptyState = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }) => (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="rounded-full bg-muted p-4 mb-4 shadow-inner">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {description}
      </p>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {loading ? <HeaderSkeleton /> : <Header title="My Incidents" />}

      {loading ? (
        <ContentSkeleton className="px-4 space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </ContentSkeleton>
      ) : (
        <>
          <PageContent className="pb-36">
            {activeTab === "favorite" ? (
              favoriteIncidents.length === 0 ? (
                <EmptyState
                  icon={HeartIcon}
                  title="No Favorites Yet"
                  description="Incidents you've favorited will appear here"
                />
              ) : (
                favoriteIncidents.map((incident) => (
                  <IncidentCard
                    key={incident._id}
                    incident={incident}
                    icon={HeartIcon}
                    userRole={profile?.role}
                    showActions
                    userLocation={userLocation}
                  />
                ))
              )
            ) : activeTab === "bookmarks" ? (
              bookmarkedIncidents.length === 0 ? (
                <EmptyState
                  icon={BookmarkIcon}
                  title="No Bookmarks Yet"
                  description="Incidents you've bookmarked will appear here"
                />
              ) : (
                bookmarkedIncidents.map((incident) => (
                  <IncidentCard
                    key={incident._id}
                    incident={incident}
                    icon={BookmarkIcon}
                    userRole={profile?.role}
                    showActions
                    userLocation={userLocation}
                  />
                ))
              )
            ) : activeTab === "responded" ? (
              respondedIncidents.length === 0 ? (
                <EmptyState
                  icon={UserCheckIcon}
                  title="No Responded Incidents"
                  description="Incidents you've responded to will appear here"
                />
              ) : (
                respondedIncidents.map((incident) => (
                  <IncidentCard
                    key={incident._id}
                    incident={incident}
                    icon={UserCheckIcon}
                    userRole={profile?.role}
                    showActions
                    userLocation={userLocation}
                  />
                ))
              )
            ) : notesIncidents.length === 0 ? (
              <EmptyState
                icon={NoteIcon}
                title="No Incidents with Notes"
                description="Incidents you've added notes to will appear here"
              />
            ) : (
              notesIncidents.map((incident) => (
                <IncidentCard
                  key={incident._id}
                  incident={incident}
                  icon={ChatCircleIcon}
                  userRole={profile?.role}
                  showActions
                  userLocation={userLocation}
                />
              ))
            )}
          </PageContent>
          <PageTabs>
            <PageTab
              active={activeTab === "favorite"}
              onClick={() => setActiveTab("favorite")}
            >
              Favorite
            </PageTab>
            <PageTab
              active={activeTab === "bookmarks"}
              onClick={() => setActiveTab("bookmarks")}
            >
              Bookmarks
            </PageTab>
            <PageTab
              active={activeTab === "responded"}
              onClick={() => setActiveTab("responded")}
            >
              Responded
            </PageTab>
            <PageTab
              active={activeTab === "notes"}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </PageTab>
          </PageTabs>
        </>
      )}
    </div>
  );
}
