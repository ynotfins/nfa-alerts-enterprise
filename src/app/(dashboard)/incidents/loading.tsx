import { Skeleton } from "@/components/ui/skeleton";

export default function IncidentsLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border-b px-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
