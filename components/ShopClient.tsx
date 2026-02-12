"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import PosterCard from "./PosterCard";
import { buttons } from "@/lib/ui/buttons";

const PAGE_SIZE = 12;

type Poster = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
};

export default function ShopClient() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mounted, setMounted] = useState(false);

  async function fetchPosters(initial = false) {
    setLoading(true);

    let postersQuery;

    if (initial) {
      postersQuery = query(
        collection(db, "posters"),
        where("isActive", "==", true),
        orderBy("createdAt", "asc"),
        limit(PAGE_SIZE)
      );
    } else {
      if (!lastDoc) {
        setLoading(false);
        return;
      }

      postersQuery = query(
        collection(db, "posters"),
        where("isActive", "==", true),
        orderBy("createdAt", "asc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
    }

    const snapshot = await getDocs(postersQuery);

    if (snapshot.empty) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const newPosters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Poster, "id">),
    }));

    setPosters((prev) => [...prev, ...newPosters]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setLoading(false);
  }

  useEffect(() => {
    setMounted(true);
    fetchPosters(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="px-2 sm:px-4">
      {/* heading */}
      <h1 className="mb-4 text-xl font-semibold tracking-tight">
        Shop Posters
      </h1>

      {/* empty state */}
      {posters.length === 0 && !loading && (
        <p className="text-sm text-white/60">No posters available right now.</p>
      )}

      {/* posters grid */}
      <div
        className="
    grid
    grid-cols-2
    gap-4
    sm:grid-cols-3
    sm:gap-5
    md:grid-cols-4
    md:gap-6
    lg:grid-cols-6
    lg:gap-7
  "
      >
        {posters.map((poster) => (
          <PosterCard
            key={poster.id}
            id={poster.id}
            title={poster.title}
            price={poster.price}
            imagePath={poster.imagePath}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => fetchPosters(false)}
            disabled={loading}
            className={`${buttons.secondary} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Custom Design CTA */}
      <div className="mt-20 border-t border-white/10 pt-12 text-center">
        <h2 className="text-xl font-semibold">
          Didn't find what you were looking for?
        </h2>

        <p className="mt-3 text-sm text-white/60">
          It's okay. Get your customised design made.
        </p>

        <a
          href="https://wa.me/919306553798?text=Hi%20I%20want%20a%20custom%20poster"
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttons.primary} mt-6 inline-block`}
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
