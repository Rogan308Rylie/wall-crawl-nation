import { PosterCardSkeleton } from "@/components/skeletons/PosterCardSkeleton";

export default function ShopLoading() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <PosterCardSkeleton key={i} />
      ))}
    </div>
  );
}
