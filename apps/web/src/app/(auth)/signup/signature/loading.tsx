import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-1 w-full" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="flex items-start space-x-3">
              <Skeleton className="h-4 w-4 mt-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 flex-1" />
        </CardFooter>
      </Card>
    </div>
  );
}
