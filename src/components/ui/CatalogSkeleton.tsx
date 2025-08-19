import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function CatalogSkeleton() {
  const skeletons = Array.from({ length: 12 }, (_, i) => (
    <Card key={i} className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-square" />
        <div className="p-6">
          <Skeleton className="h-6 mb-2" />
          <Skeleton className="h-4 mb-4 w-3/4" />
          <Skeleton className="h-8 mb-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <>
      {/* Filters Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Skeleton */}
          <div className="flex-1 max-w-md">
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-wrap gap-4 items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Results Info Skeleton */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {skeletons}
      </div>
    </>
  );
}