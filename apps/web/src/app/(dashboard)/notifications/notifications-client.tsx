"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Timestamp } from "@/components/timestamp";
import {
  BellIcon,
  FireIcon,
  ChatCircleIcon,
  UserCheckIcon,
  CheckCircleIcon,
  PencilSimpleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useNotifications } from "@/hooks/use-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Header,
  HeaderSkeleton,
  PageContent,
  ContentSkeleton,
} from "@/components/layout";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, typeof BellIcon> = {
  incident_new: FireIcon,
  incident_responded: UserCheckIcon,
  incident_activity: FireIcon,
  message_new: ChatCircleIcon,
  change_request: PencilSimpleIcon,
  change_request_approved: CheckCircleIcon,
  change_request_rejected: XCircleIcon,
};

const typeColors: Record<string, string> = {
  incident_new: "text-orange-500",
  incident_responded: "text-green-500",
  incident_activity: "text-blue-500",
  message_new: "text-purple-500",
  change_request: "text-amber-500",
  change_request_approved: "text-green-500",
  change_request_rejected: "text-red-500",
};

export default function NotificationsClient() {
  const router = useRouter();
  const {
    notifications,
    loading,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications();

  const handleClick = async (notification: (typeof notifications)[number]) => {
    if (!notification.read) {
      await markNotificationRead(notification._id);
    }
    if (notification.url) {
      router.push(notification.url);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsRead();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-full flex-col">
      {loading ? (
        <HeaderSkeleton hasActions />
      ) : (
        <Header
          title="Notifications"
          actions={
            unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMarkAllAsRead}
                className="h-9 w-9 rounded-full hover:bg-white/10"
              >
                <CheckCircleIcon className="h-5 w-5" />
              </Button>
            ) : undefined
          }
        />
      )}

      {loading ? (
        <ContentSkeleton className="space-y-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-3 border-b">
              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </ContentSkeleton>
      ) : (
        <PageContent>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <BellIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No Notifications</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                You&apos;ll see notifications here when something happens
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || BellIcon;
                const iconColor =
                  typeColors[notification.type] || "text-muted-foreground";

                return (
                  <div
                    key={notification._id}
                    className="px-4 py-3 border-b cursor-pointer transition-colors hover:bg-accent/50 active:bg-accent"
                    onClick={() => handleClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                        <Icon
                          className={cn("h-5 w-5", iconColor)}
                          weight={notification.read ? "regular" : "fill"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm leading-tight",
                              !notification.read && "font-semibold",
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                        <Timestamp
                          date={new Date(notification.createdAt)}
                          format="relative"
                          className="text-xs text-muted-foreground mt-1"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PageContent>
      )}
    </div>
  );
}
