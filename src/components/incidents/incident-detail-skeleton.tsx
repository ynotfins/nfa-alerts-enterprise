import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function IncidentDetailSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function IncidentHomeownerSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
            <Skeleton className="h-11 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function IncidentDocsSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="space-y-6">
        <Skeleton className="h-11 w-full rounded-lg" />

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function IncidentSignSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border-2 p-4">
              <div className="flex flex-col items-center text-center gap-3">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="w-full space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
