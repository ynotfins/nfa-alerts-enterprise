"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BellIcon,
  MapPinIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  WarningIcon,
  CircleNotchIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import {
  usePermissions,
  REQUIRED_PERMISSIONS,
  PermissionStatus,
} from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/auth-context";
import { Header, PageContent } from "@/components/layout";

const PERMISSION_ICONS = {
  notifications: BellIcon,
  location: MapPinIcon,
  camera: CameraIcon,
  microphone: BellIcon,
};

function StatusIndicator({ status }: { status: PermissionStatus }) {
  if (status === "granted") {
    return <CheckCircleIcon className="h-5 w-5 text-green-500" weight="fill" />;
  }
  if (status === "denied") {
    return <XCircleIcon className="h-5 w-5 text-red-500" weight="fill" />;
  }
  if (status === "unsupported") {
    return <WarningIcon className="h-5 w-5 text-amber-500" weight="fill" />;
  }
  return (
    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
  );
}

export function PermissionsPrompt() {
  const { profile } = useAuthContext();
  const {
    permissions,
    loading,
    requestPermission,
    allRequiredGranted,
    checkPermissions,
  } = usePermissions();
  const [requesting, setRequesting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRequestPermission = async (key: keyof typeof permissions) => {
    setRequesting(key);
    try {
      await requestPermission(key);
    } finally {
      setRequesting(null);
      await checkPermissions();
    }
  };

  const handleRequestAll = async () => {
    for (const perm of REQUIRED_PERMISSIONS) {
      if (
        permissions[perm.key] !== "granted" &&
        permissions[perm.key] !== "denied"
      ) {
        setRequesting(perm.key);
        await requestPermission(perm.key);
        await checkPermissions();
      }
    }
    setRequesting(null);
  };

  if (!profile) return null;
  if (!mounted || loading) return null;
  if (allRequiredGranted) return null;

  const pendingCount = REQUIRED_PERMISSIONS.filter(
    (p) => permissions[p.key] !== "granted" && permissions[p.key] !== "denied",
  ).length;

  const deniedCount = REQUIRED_PERMISSIONS.filter(
    (p) => permissions[p.key] === "denied",
  ).length;

  const grantedCount = REQUIRED_PERMISSIONS.filter(
    (p) => permissions[p.key] === "granted",
  ).length;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      <Header title="Permissions" />
      <PageContent className="px-4">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <ShieldCheckIcon
                    className="h-8 w-8 text-primary"
                    weight="duotone"
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Setup Required</h2>
                  <p className="text-sm text-muted-foreground">
                    {grantedCount}/{REQUIRED_PERMISSIONS.length} permissions
                    enabled
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                NFA Alerts needs the following permissions to send you incident
                alerts and enable location-based features.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {REQUIRED_PERMISSIONS.map((perm) => {
              const Icon = PERMISSION_ICONS[perm.key];
              const status = permissions[perm.key];
              const isRequesting = requesting === perm.key;
              const canRequest = status === "prompt";
              const isDenied = status === "denied";
              const isGranted = status === "granted";

              return (
                <Card
                  key={perm.key}
                  className={cn(
                    "transition-all",
                    isGranted && "ring-1 ring-green-200 bg-green-50/50",
                    isDenied && "ring-1 ring-red-200 bg-red-50/50",
                  )}
                >
                  <CardContent className="flex items-center gap-3">
                    <div
                      className={cn(
                        "shrink-0 p-2 rounded-full",
                        isGranted && "bg-green-100",
                        isDenied && "bg-red-100",
                        canRequest && "bg-muted",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isGranted && "text-green-600",
                          isDenied && "text-red-600",
                          canRequest && "text-muted-foreground",
                        )}
                        weight="duotone"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{perm.name}</p>
                        {perm.required && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isDenied
                          ? "Blocked - enable in settings"
                          : perm.description}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isRequesting ? (
                        <CircleNotchIcon className="h-5 w-5 animate-spin text-primary" />
                      ) : canRequest ? (
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleRequestPermission(perm.key)}
                        >
                          Allow
                        </Button>
                      ) : (
                        <StatusIndicator status={status} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {deniedCount > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-start gap-3">
                <WarningIcon
                  className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
                  weight="fill"
                />
                <div className="text-sm">
                  <p className="font-medium text-amber-900">
                    Some permissions blocked
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Open your device settings to enable blocked permissions.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {pendingCount > 0 && (
            <div className="pt-2">
              <Button
                onClick={handleRequestAll}
                className="w-full h-12"
                size="lg"
                disabled={!!requesting}
              >
                {requesting ? (
                  <>
                    <CircleNotchIcon className="h-4 w-4 mr-2 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  `Allow All (${pendingCount})`
                )}
              </Button>
            </div>
          )}
        </div>
      </PageContent>
    </div>
  );
}
