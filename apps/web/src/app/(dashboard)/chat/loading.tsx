import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      <div className="sticky z-10 bg-background border-b px-4 py-2">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-md">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 flex-1 rounded-md" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b px-4 py-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
