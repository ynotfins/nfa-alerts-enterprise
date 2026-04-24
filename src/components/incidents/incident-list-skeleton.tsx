import { Skeleton } from "@/components/ui/skeleton";

export function IncidentListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b px-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
