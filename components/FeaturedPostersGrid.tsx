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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6 lg:grid-cols-6 lg:gap-7">
      {posters.map((poster) => (
        <PosterCard
          key={poster.id}
          id={poster.id}
          title={poster.title}
          price={poster.price}
          imagePath={poster.imagePath}
          tags={poster.tags}
        />
      ))}
    </div>
  );
}
