"use client";

import { useEffect, useState, useRef } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, Check, Tag, SlidersHorizontal } from "lucide-react";
import { useInView } from "@/hooks/useInView";

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

  const [gridRef, gridInView] = useInView();
  const [carouselRef, carouselInView] = useInView();

  // Filter states
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);

  // Refs for click outside
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const sortContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "latest", label: "Sort by: Latest" },
    { value: "oldest", label: "Sort by: Oldest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "title_asc", label: "Name: A to Z" },
    { value: "title_desc", label: "Name: Z to A" },
  ];

  async function fetchPosters(initial = false, overrideSort?: string, overrideTags?: string[]) {
    setLoading(true);

    const activeSort = overrideSort || sortBy;
    const activeTags = overrideTags || selectedTags;
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
    const constraints: any[] = [
      where("isActive", "==", true),
      orderBy(field, direction),
      limit(PAGE_SIZE),
    ];

    if (activeTags.length > 0) {
      // array-contains-any works as an OR gate for up to 30 elements
      constraints.unshift(where("tags", "array-contains-any", activeTags));
    }

    if (initial) {
      postersQuery = query(
        collection(db, "posters"),
        ...constraints
      );
    } else {
      if (!lastDoc) {
        setLoading(false);
        return;
      }

      postersQuery = query(
        collection(db, "posters"),
        ...constraints,
        startAfter(lastDoc)
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

    async function fetchTags() {
      try {
        const res = await fetch("/api/admin/tags/list");
        const data = await res.json();
        if (data.tags) {
          setAllTags(data.tags.sort());
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    }
    fetchTags();

    // Setup click outside listeners
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsTagsDropdownOpen(false);
      }
      if (sortContainerRef.current && !sortContainerRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchPosters(false);
      }
    }, {
      rootMargin: "200px", // pre-fetch before reaching the bottom
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  function handleSortChange(newSort: string) {
    setSortBy(newSort);
    // Reset state before fetching new sorted data
    setPosters([]);
    setLastDoc(null);
    setHasMore(true);
    fetchPosters(true, newSort, selectedTags);
  }

  function toggleTag(tag: string) {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
    setPosters([]);
    setLastDoc(null);
    setHasMore(true);
    fetchPosters(true, sortBy, newTags);
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="
      relative
      px-2 sm:px-6 py-12
      bg-white
      min-h-screen
    ">

      {/* header container with sort and search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 border-b-8 border-black pb-8">
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-black flex flex-wrap items-center gap-3 sm:gap-4">
          Shop Posters
          <span className="text-base sm:text-xl font-bold text-white bg-black px-2 sm:px-3 py-1 border-2 border-black shadow-[3px_3px_0_0_#A3FF12] sm:shadow-[4px_4px_0_0_#A3FF12]">
            {posters.length} results
          </span>
        </h1>

        {/* Toolbar: Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-30">

          {/* Smart Tag Search Autocomplete */}
          <div className="relative w-full lg:w-[320px]" ref={searchContainerRef}>
            <div
              className={`flex items-center w-full bg-[#f0f0f0] border-4 transition-all shadow-[6px_6px_0_0_#A3FF12] ${isTagsDropdownOpen ? 'border-black bg-white' : 'border-black hover:bg-white'
                }`}
            >
              <div className="pl-4 text-black">
                <Search size={20} className="stroke-[3px]" />
              </div>
              <input
                type="text"
                placeholder="SEARCH TAGS..."
                value={tagSearch}
                onFocus={() => setIsTagsDropdownOpen(true)}
                onChange={(e) => {
                  setTagSearch(e.target.value);
                  setIsTagsDropdownOpen(true);
                }}
                className="w-full bg-transparent text-black font-black uppercase px-3 py-2 sm:py-3 outline-none placeholder:text-black/40 text-sm sm:text-base"
              />
              {tagSearch && (
                <button
                  onClick={() => {
                    setTagSearch("");
                    setIsTagsDropdownOpen(true);
                  }}
                  className="pr-4 text-black hover:text-[#A3FF12] bg-black p-1 m-1 border-2 border-transparent transition-colors"
                >
                  <X size={18} className="stroke-[3px] text-white" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {isTagsDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-4 bg-white border-4 border-black shadow-[8px_8px_0_0_#A3FF12] z-50 flex flex-col max-h-[300px]"
                >
                  <div className="overflow-y-auto p-2 custom-scrollbar flex flex-col gap-1">
                    {allTags
                      .filter(t => !selectedTags.includes(t)) // Don't show already selected tags in the list
                      .filter(t => tagSearch ? t.toLowerCase().includes(tagSearch.toLowerCase()) : true)
                      .map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            toggleTag(tag);
                            setTagSearch(""); // clear search on select
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left font-black uppercase tracking-widest text-black hover:bg-[#A3FF12] border-2 border-transparent hover:border-black transition-colors"
                        >
                          <Tag size={16} className="text-black stroke-[3px]" />
                          <span>{tag}</span>
                        </button>
                      ))}

                    {/* Empty State for Search */}
                    {tagSearch && allTags.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t)).length === 0 && (
                      <p className="text-sm font-bold uppercase text-black/50 text-center py-6">No matching tags found.</p>
                    )}

                    {/* All tags used up hint */}
                    {!tagSearch && allTags.length > 0 && allTags.filter(t => !selectedTags.includes(t)).length === 0 && (
                      <p className="text-sm font-bold uppercase text-black/50 text-center py-6">All available tags selected.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom Sorting Dropdown */}
          <div className="relative w-full sm:w-[240px]" ref={sortContainerRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between w-full bg-[#A3FF12] text-black font-black uppercase text-xs sm:text-sm border-4 border-black px-3 sm:px-4 py-2 sm:py-3 shadow-[6px_6px_0_0_#000] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#000] active:shadow-[0_0_0_0_#000] transition-all"
            >
              <span className="flex items-center gap-2 truncate">
                <SlidersHorizontal size={16} className="sm:size-[18px] stroke-[3px]" />
                <span>{sortOptions.find((o) => o.value === sortBy)?.label}</span>
              </span>
              <ChevronDown
                size={18}
                className={`stroke-[3px] transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-4 w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#A3FF12] overflow-hidden z-20 flex flex-col p-2 gap-1"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setIsSortOpen(false);
                        handleSortChange(option.value);
                      }}
                      className={`flex items-center justify-between text-left px-4 py-3 font-black uppercase text-sm border-2 border-transparent transition-colors ${sortBy === option.value
                          ? "bg-black text-[#A3FF12]"
                          : "text-black hover:border-black hover:bg-[#A3FF12]"
                        }`}
                    >
                      {option.label}
                      {sortBy === option.value && <Check size={18} className="text-[#A3FF12] stroke-[3px]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Active Tags / Filters Row */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="flex flex-wrap items-center gap-3 overflow-hidden"
          >
            <span className="text-sm font-black uppercase tracking-widest text-black mr-2 flex items-center gap-1.5 bg-[#A3FF12] border-2 border-black px-2 py-1 shadow-[2px_2px_0_0_#000]">
              Active Filters
            </span>

            {selectedTags.map((tag) => (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                key={tag}
                onClick={() => toggleTag(tag)}
                className="group flex items-center gap-2 px-3 py-1.5 border-2 border-black text-sm font-black uppercase transition-all bg-black text-[#A3FF12] shadow-[4px_4px_0_0_#A3FF12] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_#A3FF12] active:translate-y-0 active:shadow-[0_0_0_0_#000]"
              >
                {tag}
                <X size={16} className="text-[#A3FF12] group-hover:text-white transition-colors border-2 border-transparent group-hover:border-white" />
              </motion.button>
            ))}

            <button
              onClick={() => {
                setSelectedTags([]);
                setPosters([]);
                setLastDoc(null);
                setHasMore(true);
                fetchPosters(true, sortBy, []);
              }}
              className="text-sm font-black uppercase text-black hover:text-white hover:bg-black border-2 border-transparent hover:border-black ml-4 px-3 py-1.5 transition-colors"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections Carousel */}
      <div
        ref={carouselRef as any}
        className={`scroll-animate ${carouselInView ? "scroll-animate-active" : ""}`}
      >
        <CollectionsCarousel />
      </div>

      {/* spacer to separate carousel from grid if filters are empty */}
      {selectedTags.length === 0 && <div className="h-4" />}

      {/* empty state */}

      {posters.length === 0 && !loading && (
        <div className="py-24 text-center border-4 border-black bg-[#f0f0f0] shadow-[12px_12px_0_0_#A3FF12] my-12">
          <p className="text-2xl font-black uppercase text-black">
            {selectedTags.length > 0
              ? `No posters found with tags: ${selectedTags.join(", ")}`
              : "No posters available right now."}
          </p>
          {selectedTags.length > 0 && (
            <button
              onClick={() => {
                setSelectedTags([]);
                setPosters([]);
                setLastDoc(null);
                setHasMore(true);
                fetchPosters(true, sortBy, []);
              }}
              className="mt-6 border-2 border-black bg-black text-[#A3FF12] font-black uppercase tracking-widest px-4 py-2 shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all"
            >
              Clear filters
            </button>
          )}
        </div>
      )}


      {/* posters grid */}
      <div
        ref={gridRef as any}
        className={`grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6 lg:grid-cols-6 lg:gap-7 stagger-children scroll-animate ${gridInView ? "scroll-animate-active" : ""
          }`}
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

      {/* Infinite Scroll Sentinel */}
      <div
        ref={sentinelRef}
        id="infinite-scroll-sentinel"
        className="h-20 mt-8 mb-16 flex items-center justify-center"
      >
        {hasMore ? (
          <div className="flex flex-col items-center gap-4">
            {loading && (
              <div className="flex items-center gap-3 bg-black text-[#A3FF12] px-6 py-3 border-4 border-black shadow-[6px_6px_0_0_#A3FF12] animate-bounce">
                <div className="w-4 h-4 bg-[#A3FF12] rounded-full animate-ping" />
                <span className="font-black uppercase tracking-widest text-sm">Loading More Fire...</span>
              </div>
            )}
          </div>
        ) : posters.length > 0 && (
          <div className="bg-white border-4 border-black px-6 py-3 shadow-[6px_6px_0_0_#000]">
            <span className="font-black uppercase tracking-widest text-sm text-black">You've reached the end of the wall.</span>
          </div>
        )}
      </div>

      {/* Custom Design CTA */}
      <div className="mt-28 border-t-8 border-black pt-20 pb-12 text-center bg-[#A3FF12] relative w-[100vw] left-1/2 -translate-x-1/2">
        <h2 className="text-5xl font-black uppercase tracking-tight text-black drop-shadow-[4px_4px_0_white]">
          Didn't find what you were looking for?
        </h2>

        <p className="mt-6 text-xl font-bold uppercase text-black border-4 border-black inline-block bg-white px-6 py-2 shadow-[4px_4px_0_0_#000]">
          It's okay. Get your custom designs made here.
        </p>
        <br />
        <a
          href="https://wa.me/919306553798?text=Hi%20I%20want%20a%20custom%20poster"
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttons.primary} mt-10`}
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}