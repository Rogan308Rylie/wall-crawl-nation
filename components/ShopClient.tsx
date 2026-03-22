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

  // Filter states
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  
  // Refs for click outside
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const sortContainerRef = useRef<HTMLDivElement>(null);

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
      px-2 sm:px-4
      bg-gradient-to-br
      from-[#0a0a0a]
      via-[#0f0f0f]
      to-[#0a0a0a]
      overflow-hidden
    ">
      {/* Animated background gradient layer - POWDER BLUE for visibility testing */}
      <div className="absolute inset-0 -z-10 animate-bgshift opacity-100" />

      {/* header container with sort and search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">
          Shop Posters
          <span className="ml-3 text-sm font-normal text-white/40">
            {posters.length} results
          </span>
        </h1>

        {/* Toolbar: Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-30">
          
          {/* Smart Tag Search Autocomplete */}
          <div className="relative w-full sm:w-[280px]" ref={searchContainerRef}>
            <div 
              className={`flex items-center w-full bg-[#111] border transition-all rounded-xl overflow-hidden shadow-lg ${
                isTagsDropdownOpen ? 'border-white/30 ring-1 ring-white/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="pl-3 text-white/40">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search tags (e.g. anime, minimal)..."
                value={tagSearch}
                onFocus={() => setIsTagsDropdownOpen(true)}
                onChange={(e) => {
                  setTagSearch(e.target.value);
                  setIsTagsDropdownOpen(true);
                }}
                className="w-full bg-transparent text-sm text-white/90 px-3 py-2.5 outline-none placeholder:text-white/30"
              />
              {tagSearch && (
                <button 
                  onClick={() => {
                    setTagSearch("");
                    setIsTagsDropdownOpen(true);
                  }}
                  className="pr-3 text-white/40 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {isTagsDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 flex flex-col max-h-[300px]"
                >
                  <div className="overflow-y-auto p-1 py-1.5 custom-scrollbar">
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
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                        >
                          <Tag size={12} className="text-white/30" />
                          <span>{tag}</span>
                        </button>
                      ))}
                    
                    {/* Empty State for Search */}
                    {tagSearch && allTags.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(t)).length === 0 && (
                       <p className="text-xs text-white/30 text-center py-4">No matching tags found.</p>
                    )}

                    {/* All tags used up hint */}
                    {!tagSearch && allTags.length > 0 && allTags.filter(t => !selectedTags.includes(t)).length === 0 && (
                      <p className="text-xs text-white/30 text-center py-4">All available tags selected.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom Sorting Dropdown */}
          <div className="relative w-full sm:w-[200px]" ref={sortContainerRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between w-full bg-[#111] hover:bg-white/5 text-sm text-white/90 border border-white/10 rounded-xl px-4 py-2.5 transition-all shadow-lg"
            >
              <span className="flex items-center gap-2 truncate text-white/70">
                <SlidersHorizontal size={14} className="text-white/40" />
                <span className="text-white/90">{sortOptions.find((o) => o.value === sortBy)?.label}</span>
              </span>
              <ChevronDown 
                size={14} 
                className={`text-white/40 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} 
              />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-full bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden z-20 flex flex-col p-1"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setIsSortOpen(false);
                        handleSortChange(option.value);
                      }}
                      className={`flex items-center justify-between text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        sortBy === option.value
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/60 hover:bg-white/5 hover:text-white/90"
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && <Check size={14} className="text-white/70" />}
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
            className="flex flex-wrap items-center gap-2 overflow-hidden"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-white/30 mr-1 flex items-center gap-1.5">
              Active Filters
            </span>
            
            {selectedTags.map((tag) => (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                key={tag}
                onClick={() => toggleTag(tag)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-white text-black hover:bg-neutral-200 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              >
                {tag}
                <X size={12} className="text-black/50 group-hover:text-black transition-colors" />
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
              className="text-xs font-medium text-white/30 hover:text-red-400 underline underline-offset-4 ml-2 px-2 py-1.5 transition-colors"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections Carousel */}
      <CollectionsCarousel />

      {/* spacer to separate carousel from grid if filters are empty */}
      {selectedTags.length === 0 && <div className="h-4" />}

      {/* empty state */}

      {posters.length === 0 && !loading && (
        <div className="py-20 text-center">
          <p className="text-sm text-white/60">
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
              className="mt-4 text-xs text-white/40 hover:text-white underline"
            >
              Clear filters
            </button>
          )}
        </div>
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