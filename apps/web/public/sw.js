const CACHE_VERSION = "v12";

let geofenceEnabled = false;
let geofenceRadius = 0.5;
let notifiedIncidents = new Set();

function calculateDistance(lat1, lng1, lat2, lng2) {
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

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_VERSION) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  try {
    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) {
      return;
    }

    if (url.hostname.includes("google") || url.hostname.includes("gstatic")) {
      return;
    }

    if (
      url.pathname.includes("/api/auth") ||
      url.pathname.includes("/api/session")
    ) {
      return;
    }

    if (event.request.method !== "GET") {
      return;
    }

    event.respondWith(
      fetch(event.request, { credentials: "include" }).catch(async () => {
        const response = await caches.match(event.request);
        return (
          response ||
          new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          })
        );
      }),
    );
  } catch {
    return;
  }
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const isMessage = data.type === "message" || data.type === "chat";
  const isIncident = data.type === "incident";
  const isActivity = data.type === "activity";

  const title =
    data.title || (isMessage ? "New Message" : "New Incident Alert");
  const body =
    data.body ||
    (isMessage ? "You have new messages" : "A new incident requires attention");
  const url = data.url || (isMessage ? "/chat" : "/incidents");

  const tag =
    data.tag ||
    (data.threadId
      ? `thread-${data.threadId}`
      : data.incidentId
        ? `incident-${data.incidentId}`
        : isMessage
          ? "message"
          : "incident");

  const options = {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    image: data.image,
    data: {
      url,
      incidentId: data.incidentId,
      threadId: data.threadId,
      notificationType: data.type || (isMessage ? "message" : "incident"),
    },
    tag,
    requireInteraction: isIncident || isActivity,
    renotify: true,
    vibrate: isIncident ? [300, 100, 300, 100, 300] : [200, 100, 200],
    silent: data.silent || false,
    actions: isMessage
      ? [
          { action: "view", title: "View", icon: "/icon-192.png" },
          { action: "dismiss", title: "Dismiss" },
        ]
      : isIncident
        ? [
            { action: "respond", title: "Respond", icon: "/icon-192.png" },
            { action: "view", title: "View Details" },
            { action: "dismiss", title: "Dismiss" },
          ]
        : [
            { action: "view", title: "View", icon: "/icon-192.png" },
            { action: "dismiss", title: "Dismiss" },
          ],
  };

  if (data.badgeCount !== undefined && "setAppBadge" in navigator) {
    if (data.badgeCount > 0) {
      navigator.setAppBadge(data.badgeCount);
    } else {
      navigator.clearAppBadge();
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  const action = event.action;
  const notificationData = event.notification.data || {};

  if (action === "dismiss") {
    event.notification.close();
    return;
  }

  let urlToOpen = notificationData.url || "/incidents";

  if (action === "respond" && notificationData.incidentId) {
    urlToOpen = `/incidents/${notificationData.incidentId}?action=respond`;
  } else if (action === "view") {
    urlToOpen = notificationData.url || "/incidents";
  }

  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          const targetUrl = new URL(urlToOpen, self.location.origin);

          if (clientUrl.pathname === targetUrl.pathname && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "UPDATE_BADGE") {
    const count = event.data.count;

    if ("setAppBadge" in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count);
      } else {
        navigator.clearAppBadge();
      }
    }
  }

  if (event.data && event.data.type === "GEOFENCE_ENABLED") {
    geofenceEnabled = true;
    geofenceRadius = event.data.radius || 0.5;
    notifiedIncidents.clear();
  }

  if (event.data && event.data.type === "GEOFENCE_DISABLED") {
    geofenceEnabled = false;
  }

  if (event.data && event.data.type === "GEOFENCE_CHECK") {
    if (!geofenceEnabled) return;

    const { lat, lng, incidents } = event.data;
    if (!lat || !lng || !incidents) return;

    for (const incident of incidents) {
      if (notifiedIncidents.has(incident.id)) continue;

      const distance = calculateDistance(lat, lng, incident.lat, incident.lng);
      if (distance <= geofenceRadius) {
        notifiedIncidents.add(incident.id);

        self.registration.showNotification("Nearby Incident", {
          body: `${incident.displayId} - ${incident.address} (${distance.toFixed(1)} mi)`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: `geofence-${incident.id}`,
          data: {
            url: `/incidents/${incident.id}`,
            incidentId: incident.id,
            notificationType: "geofence",
          },
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200],
        });
      }
    }
  }

  if (event.data && event.data.type === "SIGN_OUT") {
    geofenceEnabled = false;
    notifiedIncidents.clear();
    event.waitUntil(
      Promise.all([
        caches
          .keys()
          .then((cacheNames) =>
            Promise.all(cacheNames.map((name) => caches.delete(name))),
          ),
        self.registration
          .getNotifications()
          .then((notifications) =>
            Promise.all(notifications.map((n) => n.close())),
          ),
        "clearAppBadge" in navigator
          ? navigator.clearAppBadge()
          : Promise.resolve(),
      ]),
    );
  }
});
