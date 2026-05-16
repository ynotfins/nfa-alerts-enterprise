"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  FlameIcon,
  HeartIcon,
  ChatCircleIcon,
  UserIcon,
  UsersIcon,
  MapPinIcon,
  UserGearIcon,
  BellIcon,
  PathIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/auth-context";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { useUnreadCount } from "@/hooks/use-chat";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";
import { useMessageNotifications } from "@/hooks/use-message-notifications";
import { useAppBadge } from "@/hooks/use-app-badge";
import { useBackgroundGeofencing } from "@/hooks/use-geofencing";

const baseNavItems = [
  {
    href: "/incidents",
    icon: FlameIcon,
    label: "Incidents",
    tourId: "nav-incidents",
  },
  {
    href: "/favorites",
    icon: HeartIcon,
    label: "Favorites",
    tourId: "nav-favorites",
  },
  {
    href: "/route",
    icon: PathIcon,
    label: "Route",
    tourId: "nav-route",
  },
  {
    href: "/notifications",
    icon: BellIcon,
    label: "Notifications",
    tourId: "nav-notifications",
  },
  {
    href: "/chat",
    icon: ChatCircleIcon,
    label: "Chat",
    tourId: "nav-chat",
  },
  {
    href: "/profile",
    icon: UserIcon,
    label: "Profile",
    tourId: "nav-profile",
  },
];

const supeNavItem = {
  href: "/chasers",
  icon: UsersIcon,
  label: "Chasers",
  tourId: "nav-chasers",
};

const adminNavItems = [
  {
    href: "/admin/users",
    icon: UserGearIcon,
    label: "Users",
    tourId: "nav-users",
  },
  {
    href: "/admin/locations",
    icon: MapPinIcon,
    label: "Locations",
    tourId: "nav-locations",
  },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isChatDetailPage = pathname.startsWith("/chat/");
  const hideBottomBar = isChatDetailPage;
  const hasPageTabs =
    pathname === "/chat" ||
    pathname === "/favorites" ||
    pathname.startsWith("/incidents/");
  const unreadCount = useUnreadCount();
  const notificationCount = useUnreadNotificationCount();

  useMessageNotifications();
  useAppBadge(unreadCount || 0);
  useBackgroundGeofencing();

  const isAdmin = profile?.role === "admin";
  const isSupe = profile?.role === "supe" || profile?.role === "admin";

  let navItems = baseNavItems;
  if (isAdmin) {
    navItems = [
      baseNavItems[0],
      baseNavItems[1],
      baseNavItems[2],
      ...adminNavItems,
      baseNavItems[3],
      baseNavItems[4],
      baseNavItems[5],
    ];
  } else if (isSupe) {
    navItems = [
      baseNavItems[0],
      baseNavItems[1],
      baseNavItems[2],
      baseNavItems[3],
      supeNavItem,
      baseNavItems[4],
      baseNavItems[5],
    ];
  }

  return (
    <div className="flex h-screen flex-col">
      <main className="flex-1 overflow-y-auto">
        <div className={hideBottomBar ? "" : "pb-32"}>{children}</div>
      </main>

      {!hideBottomBar && (
        <>
          <PWAInstallPrompt />
          <div className="fixed bottom-0 left-0 right-0 h-40 bg-linear-to-t from-background from-20% via-background/80 via-50% to-transparent pointer-events-none z-40"></div>

          <nav className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md">
            <div
              className="relative border border-border/50 bg-card/80 backdrop-blur-xl shadow-sm transition-all duration-300 ease-in-out"
              style={{
                borderRadius: hasPageTabs ? "0 0 1rem 1rem" : "1rem",
                borderTop: hasPageTabs ? "none" : undefined,
              }}
            >
              <div
                className="overflow-x-auto scrollbar-hide"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="flex h-20 items-center gap-2 px-2 min-w-max">
                  {navItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    const IconComponent = item.icon;

                    const showChatBadge =
                      item.href === "/chat" &&
                      unreadCount !== undefined &&
                      unreadCount > 0;
                    const showNotificationBadge =
                      item.href === "/notifications" &&
                      notificationCount !== undefined &&
                      notificationCount > 0;
                    const showBadge = showChatBadge || showNotificationBadge;
                    const badgeCount = showChatBadge
                      ? unreadCount
                      : notificationCount;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-tour={item.tourId}
                        className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-accent/50 hover:scale-105 active:scale-95 min-w-[80px] relative"
                      >
                        <div className="relative transition-transform duration-200">
                          <IconComponent
                            className={cn(
                              "h-6 w-6 transition-colors duration-200",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                            weight={isActive ? "fill" : "regular"}
                          />
                          {showBadge && badgeCount !== undefined && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 animate-in zoom-in duration-200">
                              {badgeCount > 99 ? "99+" : badgeCount}
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs whitespace-nowrap transition-colors duration-200",
                            isActive
                              ? "text-primary font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              {navItems.length > 5 && (
                <>
                  <div
                    className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-card/80 to-transparent"
                    style={{
                      borderRadius: hasPageTabs
                        ? "0 0 0 1rem"
                        : "1rem 0 0 1rem",
                    }}
                  />
                  <div
                    className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card/80 to-transparent"
                    style={{
                      borderRadius: hasPageTabs
                        ? "0 0 1rem 0"
                        : "0 1rem 1rem 0",
                    }}
                  />
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
