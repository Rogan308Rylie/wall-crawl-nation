"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PosterDetailsModal from "./shop/PosterDetailsModal";

type Poster = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  tags?: string[];
};

export default function GlobalPosterModalWrapper({ posters }: { posters: Poster[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const posterId = searchParams.get("poster");
  const [posterData, setPosterData] = useState<Poster | null>(null);

  useEffect(() => {
    if (posterId) {
      const existing = posters.find((p) => p.id === posterId);
      if (existing) {
        setPosterData(existing);
      } else {
        getDoc(doc(db, "posters", posterId)).then((snap) => {
          if (snap.exists()) {
            setPosterData({ id: snap.id, ...snap.data() } as Poster);
          }
        });
      }
    } else {
      setPosterData(null);
    }
  }, [posterId, posters]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("poster");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (!posterId || !posterData) return null;

  // Find next/prev from posters list if possible
  const index = posters.findIndex((p) => p.id === posterData.id);
  const prevPosterId = index > 0 ? posters[index - 1].id : undefined;
  const nextPosterId = index !== -1 && index < posters.length - 1 ? posters[index + 1].id : undefined;

  return (
    <PosterDetailsModal
      id={posterData.id}
      title={posterData.title}
      price={posterData.price}
      imagePath={posterData.imagePath}
      tags={posterData.tags}
      isOpen={!!posterId}
      onClose={handleClose}
      prevPosterId={prevPosterId}
      nextPosterId={nextPosterId}
    />
  );
}
