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
import CollectionsCarousel from "./shop/CollectionsCarousel";
import { buttons } from "@/lib/ui/buttons";

const PAGE_SIZE = 12;

type Poster = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  tags?: string[];
};

export default function ShopClient() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState("title_asc"); // default sorting
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = [
    { value: "latest", label: "Sort by: Latest" },
    { value: "oldest", label: "Sort by: Oldest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "title_asc", label: "Name: A to Z" },
    { value: "title_desc", label: "Name: Z to A" },
  ];

  async function fetchPosters(initial = false, overrideSort?: string) {
    setLoading(true);

    const activeSort = overrideSort || sortBy;
    let field = "title";
    let direction: "asc" | "desc" = "asc"; // Default strictly tied to Name: A-Z

    if (activeSort === "latest") {
      field = "createdAt";
      direction = "desc";
    } else if (activeSort === "oldest") {
      field = "createdAt";
      direction = "asc";
    } else if (activeSort === "price_asc") {
      field = "price";
      direction = "asc";
    } else if (activeSort === "price_desc") {
      field = "price";
      direction = "desc";
    } else if (activeSort === "title_desc") {
      field = "title";
      direction = "desc";
    }

    let postersQuery;

    if (initial) {
      postersQuery = query(
        collection(db, "posters"),
        where("isActive", "==", true),
        orderBy(field, direction),
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
        orderBy(field, direction),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
    }

    let snapshot;
    try {
      snapshot = await getDocs(postersQuery);
    } catch (err: any) {
      console.error("Firestore error (you might need to create an index):", err);
      // Keep loading false and return to prevent infinite loop
      setLoading(false);
      setHasMore(false);
      return;
    }

    if (snapshot.empty) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const newPosters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Poster, "id">),
    }));

    // Deduplicate: only add posters that don't already exist
    setPosters((prev) => {
      const existingIds = new Set(prev.map(p => p.id));
      const uniqueNewPosters = newPosters.filter(p => !existingIds.has(p.id));
      return [...prev, ...uniqueNewPosters];
    });

    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setLoading(false);
  }

  useEffect(() => {
    setMounted(true);
    fetchPosters(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSortChange(newSort: string) {
    setSortBy(newSort);
    // Reset state before fetching new sorted data
    setPosters([]);
    setLastDoc(null);
    setHasMore(true);
    fetchPosters(true, newSort);
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="
      relative
      px-2 sm:px-4
      bg-gradient-to-br
      from-[#0a0a0a]
      via-[#0f0f0f]
      to-[#0a0a0a]
      overflow-hidden
    ">
      {/* Animated background gradient layer - POWDER BLUE for visibility testing */}
      <div className="absolute inset-0 -z-10 animate-bgshift opacity-100" />

      {/* header container with sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Shop Posters
        </h1>

        {/* Custom Sorting Dropdown */}
        <div className="relative z-30">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center justify-between w-full sm:w-[200px] bg-[#111] hover:bg-[#1a1a1a] text-sm text-white/90 border border-white/10 rounded-xl px-4 py-2.5 transition-all shadow-lg"
          >
            <span className="truncate">
              {sortOptions.find(o => o.value === sortBy)?.label}
            </span>
            <svg
              className={`w-4 h-4 text-white/50 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSortOpen && (
            <>
              {/* Invisible overlay to close dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsSortOpen(false)} 
              />
              
              <div className="absolute right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-[200px] bg-[#111] border border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden z-20 flex flex-col p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setIsSortOpen(false);
                      handleSortChange(option.value);
                    }}
                    className={`text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      sortBy === option.value
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* empty state */}
      {posters.length === 0 && !loading && (
        <p className="text-sm text-white/60">No posters available right now.</p>
      )}

      {/* Collections Carousel */}
      <CollectionsCarousel />

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
            tags={poster.tags}
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
          It's okay. Get your custom designs made here.
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