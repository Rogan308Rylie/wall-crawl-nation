import { Skeleton } from "@/lib/ui/skeleton";

export function OrderRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#111] p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>

      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}
