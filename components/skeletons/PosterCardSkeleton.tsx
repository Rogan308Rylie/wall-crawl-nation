import { Skeleton } from "@/lib/ui/skeleton";

export function PosterCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#111] p-3">
      {/* Poster frame */}
      <Skeleton className="aspect-[210/297] w-full rounded-xl" />

      {/* Title */}
      <Skeleton className="h-4 w-3/4" />

      {/* Price */}
      <Skeleton className="h-3 w-1/4" />

      {/* Button */}
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}
