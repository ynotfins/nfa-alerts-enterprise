import { Prohibit } from "@phosphor-icons/react/dist/ssr";

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <Prohibit className="h-10 w-10 text-destructive" weight="fill" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            This device has been banned from accessing NFA Alerts due to policy violations.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
