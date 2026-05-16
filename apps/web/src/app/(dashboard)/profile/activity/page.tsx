"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BellIcon, ClockIcon, DocumentTextIcon, PencilSquareIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { Header } from "@/components/layout";
import { useCurrentProfile } from "@/hooks/use-profiles";
import { getActivities } from "@/services/profiles";
import { Activity } from "@/lib/db";

export default function MyActivityPage() {
  const { profile, loading } = useCurrentProfile();
  const [activities, setActivities] = useState<Array<Activity & { _id: string }>>([]);
  const isLoading = loading;

  useEffect(() => {
    if (profile?._id) {
      getActivities(profile._id).then(setActivities);
    }
  }, [profile?._id]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-4 py-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="My Activity" back="/profile" />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <BellIcon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">
                  {profile.stats?.alertsResponded || 0}
                </p>
                <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                  Alerts Responded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                  <ClockIcon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">
                  {profile.stats?.daysActive || 0}
                </p>
                <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                  Days Active
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ClockIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-center">
                    No recent activity to display
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Your activity will appear here once you start responding to incidents
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const getActivityIcon = () => {
                      switch (activity.type) {
                        case "incident_responded":
                        case "incident_completed":
                          return <BellIcon className="h-5 w-5" />;
                        case "document_uploaded":
                          return <DocumentTextIcon className="h-5 w-5" />;
                        case "signature_captured":
                          return <PencilSquareIcon className="h-5 w-5" />;
                        case "note_added":
                          return <DocumentTextIcon className="h-5 w-5" />;
                        case "message_sent":
                          return <ChatBubbleLeftIcon className="h-5 w-5" />;
                        default:
                          return <ClockIcon className="h-5 w-5" />;
                      }
                    };

                    return (
                      <div
                        key={activity._id}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 shrink-0">
                          {getActivityIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(activity.createdAt))} ago
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {profile.role === "chaser" && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span className="font-medium">--%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium">--%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Performance metrics will be calculated after responding to your first incident
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
