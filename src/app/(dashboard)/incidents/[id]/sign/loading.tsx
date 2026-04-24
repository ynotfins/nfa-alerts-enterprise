import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border-2 bg-card p-4">
              <div className="flex flex-col items-center text-center gap-3">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>

      <div className="flex gap-2">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-32" />
      </div>
    </div>
  );
}
