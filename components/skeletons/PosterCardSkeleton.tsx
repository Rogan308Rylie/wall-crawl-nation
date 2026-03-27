import { Skeleton } from "@/lib/ui/skeleton";

export function PosterCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 border-4 border-black bg-white p-3 shadow-[6px_6px_0_0_#A3FF12]">
      {/* Poster frame */}
      <Skeleton className="aspect-[210/297] w-full border-4 border-black !rounded-none" />

      {/* Info Container */}
      <div className="flex items-start justify-between gap-1">
        <Skeleton className="h-4 w-3/4 !rounded-none" />
        <Skeleton className="h-5 w-1/4 !rounded-none" />
      </div>

      {/* Button */}
      <Skeleton className="h-10 w-full mt-auto !rounded-none" />
    </div>
  );
}
