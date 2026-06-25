"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import PosterCard from "./PosterCard";
import { useInView } from "@/hooks/useInView";

type Poster = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  tags?: string[];
};

export default function FeaturedPostersGrid() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridRef, gridInView] = useInView();

  useEffect(() => {
    async function fetchFeaturedPosters() {
      try {
        const postersQuery = query(
          collection(db, "posters"),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(6)
        );

        const snapshot = await getDocs(postersQuery);

        const fetchedPosters = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Poster, "id">),
        }));

        setPosters(fetchedPosters);
      } catch (error) {
        console.error("Error fetching featured posters:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedPosters();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6 lg:grid-cols-6 lg:gap-7">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-[#111] ring-1 ring-white/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (posters.length === 0) {
    return (
      <p className="text-white/60 text-sm">
        No posters available right now. Check back soon!
      </p>
    );
  }

  return (
    <div
      ref={gridRef as any}
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6 lg:grid-cols-6 lg:gap-7 stagger-children scroll-animate ${
        gridInView ? "scroll-animate-active" : ""
      }`}
    >
      {posters.map((poster, index) => {
        const prevPosterId = index > 0 ? posters[index - 1].id : undefined;
        const nextPosterId = index < posters.length - 1 ? posters[index + 1].id : undefined;

        return (
          <PosterCard
            key={poster.id}
            id={poster.id}
            title={poster.title}
            price={poster.price}
            imagePath={poster.imagePath}
            tags={poster.tags}
            prevPosterId={prevPosterId}
            nextPosterId={nextPosterId}
          />
        );
      })}
    </div>
  );
}
