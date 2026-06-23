"use client";

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { useCart } from "@/context/CartContext"
import { buttons } from "@/lib/ui/buttons"
import PosterDetailsModal from "./PosterDetailsModal"

interface Poster {
  id: string
  title: string
  imagePath: string
  price: number
}

interface Collection {
  id: string
  title: string
  description?: string
  posterIds: string[]
  originalTotal: number
  discountedPrice: number
  posters?: Poster[]
}

export default function CollectionPreviewModal({
  collection,
  open,
  onClose
}: {
  collection: Collection
  open: boolean
  onClose: () => void
}) {
  const { addToCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [activeDetailsPoster, setActiveDetailsPoster] = useState<Poster | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!mounted) return null
  if (!open) return null

  const posters = collection.posters || []
  const savings = collection.originalTotal - collection.discountedPrice

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border-8 border-black w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 md:p-10 relative shadow-[16px_16px_0_0_#A3FF12]" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 md:right-8 md:top-8 text-3xl md:text-4xl text-black hover:text-[#A3FF12] transition font-black hover:rotate-90 z-10"
          aria-label="Close preview"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mt-8 md:mt-0">
          {/* Left Column: Posters Collage */}
          <div className="flex flex-col justify-start">
            <h3 className="text-xs font-black uppercase text-black/40 mb-4 tracking-widest">Included Posters (Click for Details)</h3>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {posters.map((poster) => (
                <div 
                  key={poster.id} 
                  onClick={() => setActiveDetailsPoster(poster)}
                  data-cursor="poster"
                  className="group border-4 border-black p-2 bg-[#f0f0f0] shadow-[4px_4px_0_0_#A3FF12] hover:shadow-[8px_8px_0_0_#A3FF12] transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-1"
                >
                  <div className="relative aspect-[210/297] border-2 border-black overflow-hidden bg-white">
                    <Image
                      src={poster.imagePath}
                      alt={poster.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-contain transition transform group-hover:scale-105 select-none pointer-events-none"
                      style={{ WebkitUserDrag: "none" } as React.CSSProperties}
                    />
                    <div
                      className="absolute inset-0 z-10"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                  <div className="mt-2 text-xs font-black uppercase text-black line-clamp-1 text-center group-hover:text-black">
                    {poster.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Bundle Info */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase text-black leading-none tracking-tight mb-4 pr-12 md:pr-16">
              {collection.title}
            </h2>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm md:text-base font-black uppercase text-white bg-black px-3 py-1 border-2 border-black shadow-[3px_3px_0_0_#A3FF12]">
                {posters.length} Posters Bundle
              </span>
              <span className="text-xs md:text-sm font-black uppercase text-black border-2 border-black px-3 py-1 bg-white">
                Save ₹{savings}
              </span>
            </div>

            {collection.description && (
              <p className="text-sm md:text-base font-bold text-black/80 mb-6 border-l-4 border-black pl-3">
                {collection.description}
              </p>
            )}

            <div className="border-4 border-black p-4 bg-[#f9f9f9] mb-8">
              <h4 className="font-black uppercase text-sm mb-2 text-black underline decoration-4 decoration-[#A3FF12]">Bundle Details</h4>
              <ul className="text-xs md:text-sm font-bold text-black/80 space-y-1">
                <li>• All {posters.length} prints included in this package</li>
                <li>• Premium A4 sizing (210 × 297 mm) on 300GSM paper</li>
                <li>• Curated set representing a cohesive wall aesthetic</li>
                <li>• Securely shipped in protective flat packaging</li>
              </ul>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className="line-through text-sm sm:text-base font-black text-black/50">
                ₹{collection.originalTotal}
              </span>
              <span className="text-2xl md:text-4xl font-black text-black bg-[#A3FF12] px-4 py-2 border-4 border-black shadow-[6px_6px_0_0_#000]">
                ₹{collection.discountedPrice}
              </span>
            </div>

            <button
              onClick={() => {
                addToCart({
                  type: "collection",
                  id: collection.id,
                  title: collection.title,
                  price: collection.discountedPrice,
                  posterIds: collection.posterIds,
                  coverImage: posters[0]?.imagePath || "/posters/default-cover.jpg"
                })
                onClose()
              }}
              className={`${buttons.primary} w-full text-xl py-4 shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all`}
            >
              Add Bundle to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Poster Details Modal */}
      {activeDetailsPoster && (
        <PosterDetailsModal
          id={activeDetailsPoster.id}
          title={activeDetailsPoster.title}
          price={activeDetailsPoster.price}
          imagePath={activeDetailsPoster.imagePath}
          isOpen={true}
          onClose={() => setActiveDetailsPoster(null)}
        />
      )}
    </div>,
    document.body
  )
}
