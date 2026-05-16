import { Shell } from "@/components/layout";
import { Protected } from "@/components/auth";
import { Presence } from "@/components/presence";
import { PushNotificationProvider } from "@/components/push-notification-provider";
import { PermissionsPrompt } from "@/components/permissions-prompt";
import { WalkthroughProvider } from "@/components/walkthrough-provider";
import { GoogleMapsProvider } from "@/components/google-maps-provider";
import { ProfilesProvider } from "@/contexts/profiles-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      <Presence />
      <ProfilesProvider>
        <PushNotificationProvider>
          <GoogleMapsProvider>
            <Shell>{children}</Shell>
            <PermissionsPrompt />
            <WalkthroughProvider />
          </GoogleMapsProvider>
        </PushNotificationProvider>
      </ProfilesProvider>
    </Protected>
  );
}
