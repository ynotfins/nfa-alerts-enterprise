import { Skeleton } from "@/components/ui/skeleton";

export default function ChasersLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <Skeleton className="h-7 w-24" />
      </div>

      <div className="sticky z-10 bg-background border-b px-4 py-2">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-md">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 flex-1 rounded-md" />
        </div>
      </div>

      <div className="sticky z-10 bg-background border-b px-4 py-3">
        <Skeleton className="h-11 w-full" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-b px-4 py-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-4 mt-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
