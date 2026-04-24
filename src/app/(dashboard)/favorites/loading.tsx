import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none border-b bg-background px-4 py-3">
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full max-w-xs" />
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
