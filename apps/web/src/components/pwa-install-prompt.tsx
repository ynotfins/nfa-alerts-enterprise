"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function Step({
  icon,
  text,
  number,
}: {
  icon?: React.ReactNode;
  text: string;
  number?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {number ? <span className="text-sm font-bold">3</span> : icon}
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

// Type for BeforeInstallPromptEvent (not in standard TypeScript DOM types)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Type for navigator with getInstalledRelatedApps
interface NavigatorWithInstalledApps extends Navigator {
  getInstalledRelatedApps?: () => Promise<Array<{ platform: string; url: string }>>;
  standalone?: boolean;
}

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const checkInstalled = async () => {
    const nav = navigator as NavigatorWithInstalledApps;
    if (nav.getInstalledRelatedApps) {
      try {
        const apps = await nav.getInstalledRelatedApps();
        setIsInstalled(apps?.length > 0);
      } catch {}
    }
  };

  useEffect(() => {
    const nav = window.navigator as NavigatorWithInstalledApps;
    if (
      localStorage.getItem("skip-pwa") === "true" ||
      process.env.NODE_ENV === "development" ||
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone
    ) {
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    // Use Promise.resolve to move setState into .then() callback
    Promise.resolve().then(() => {
      setIsIOS(/iphone|ipad|ipod/.test(ua));
      // Check if app is installed
      const nav = navigator as NavigatorWithInstalledApps;
      if (nav.getInstalledRelatedApps) {
        nav.getInstalledRelatedApps()
          .then((apps) => setIsInstalled(apps?.length > 0))
          .catch(() => {});
      }
      setShow(true);
    });

    const handlers = {
      beforeinstallprompt: (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      },
      appinstalled: () => setIsInstalled(true),
      visibilitychange: () => {
        if (document.visibilityState === "visible") checkInstalled();
      },
    };

    window.addEventListener("beforeinstallprompt", handlers.beforeinstallprompt);
    window.addEventListener("appinstalled", handlers.appinstalled);
    document.addEventListener("visibilitychange", handlers.visibilitychange);

    const interval = setInterval(checkInstalled, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlers.beforeinstallprompt);
      window.removeEventListener("appinstalled", handlers.appinstalled);
      document.removeEventListener("visibilitychange", handlers.visibilitychange);
      clearInterval(interval);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (!isIOS) {
      const link = document.createElement("a");
      link.href = "/android.apk";
      link.download = "nfa-alerts.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-100 bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <img
              src="/icon-192.png"
              alt="NFA Alerts"
              className="w-16 h-16 rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold">Install NFA Alerts</h1>
          <p className="text-muted-foreground">
            For the best experience, install this app on your device. It works
            offline and loads instantly.
          </p>
        </div>

        {isInstalled ? (
          <Button
            onClick={() => window.location.reload()}
            size="lg"
            className="w-full h-12 text-base"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Open App
          </Button>
        ) : (
          <>
            <Button
              onClick={handleInstallClick}
              size="lg"
              className="w-full h-12 text-base"
            >
              <Download className="h-5 w-5 mr-2" />
              Install App
            </Button>

            <div className="space-y-4 text-left bg-muted/50 rounded-xl p-4">
              <p className="font-semibold text-sm">
                {isIOS ? "To install on iOS:" : "To install:"}
              </p>
              <div className="space-y-3">
                {isIOS ? (
                  <>
                    <Step icon={<Share className="h-4 w-4" />} text="Tap the Share button in Safari" />
                    <Step icon={<PlusSquare className="h-4 w-4" />} text="Tap Add to Home Screen" />
                    <Step text="Tap Add to confirm" number />
                  </>
                ) : (
                  <>
                    <Step icon={<MoreVertical className="h-4 w-4" />} text="Tap the menu (three dots) in browser" />
                    <Step icon={<Download className="h-4 w-4" />} text="Tap Install app or Add to Home screen" />
                  </>
                )}
              </div>
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          This app requires installation to function properly.
        </p>
      </div>
    </div>
  );
}
