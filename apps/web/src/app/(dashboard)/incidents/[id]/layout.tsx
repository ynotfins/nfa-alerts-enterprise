"use client";

import { usePathname, useParams, useRouter } from "next/navigation";
import { LockIcon } from "@phosphor-icons/react";
import { useIncident } from "@/hooks/use-incidents";
import { useAuthContext } from "@/contexts/auth-context";
import { App, AppTab } from "@/components/app";

const tabConfigs = [
  { label: "Details", href: "", requiresResponse: false, supeOnly: false },
  {
    label: "Homeowner",
    href: "/homeowner",
    requiresResponse: false,
    supeOnly: false,
  },
  { label: "Docs", href: "/docs", requiresResponse: true, supeOnly: false },
  { label: "Sign", href: "/sign", requiresResponse: true, supeOnly: false },
];

export default function IncidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id as string;

  const { incident, loading } = useIncident(incidentId);
  const { profile } = useAuthContext();

  const isSupe = profile?.role === "supe" || profile?.role === "admin";
  const hasResponded =
    (profile?._id && incident?.responderIds?.includes(profile._id)) || false;

  const tabs: AppTab[] = tabConfigs
    .filter((tab) => !tab.supeOnly || isSupe)
    .map((tab) => {
      const tabPath = `/incidents/${incidentId}${tab.href}`;
      const isActive =
        tab.href === ""
          ? pathname === `/incidents/${incidentId}`
          : pathname.startsWith(tabPath);
      const isLocked = tab.requiresResponse && !hasResponded && !isSupe;

      return {
        label: tab.label,
        active: isActive,
        disabled: isLocked,
        onClick: () => router.push(tabPath),
        icon: isLocked ? <LockIcon className="h-3 w-3" /> : undefined,
      };
    });

  return (
    <App
      title="Incident Details"
      back="/incidents"
      tabs={tabs}
      loading={loading}
    >
      {children}
    </App>
  );
}
