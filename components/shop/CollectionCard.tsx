"use client"

import { useEffect, useState, useRef } from "react"
import { useCart } from "@/context/CartContext"
import { buttons } from "@/lib/ui/buttons"
import CollectionPreviewModal from "./CollectionPreviewModal"

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

export default function CollectionCard({ collection }: { collection: Collection }) {
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sliding, setSliding] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left")
  const [previewOpen, setPreviewOpen] = useState(false)

  const posters = collection.posters || []
  const cartItem = cart.find((item) => item.id === collection.id)
  const quantity = cartItem?.quantity || 0

  function slideTo(nextIndex: number, direction: "left" | "right") {
    if (sliding) return
    setSlideDirection(direction)
    setSliding(true)

    setTimeout(() => {
      setCurrentIndex(nextIndex)
      setSliding(false)
      setProgress(0)
    }, 300)
  }

  // Auto rotation with progress bar
  useEffect(() => {
    if (paused || posters.length <= 1) return

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100
        return p + 2
      })
    }, 60)

    const rotationTimeout = setTimeout(() => {
      const next = (currentIndex + 1) % posters.length
      slideTo(next, "left")
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(rotationTimeout)
    }
  }, [currentIndex, paused, posters.length, sliding])

  const handleNavigation = (direction: "prev" | "next") => {
    if (sliding) return
    setProgress(0)

    if (direction === "prev") {
      const prev = (currentIndex - 1 + posters.length) % posters.length
      slideTo(prev, "right")
    } else {
      const next = (currentIndex + 1) % posters.length
      slideTo(next, "left")
    }
  }

  const discountPercent = Math.round(
    (1 - collection.discountedPrice / collection.originalTotal) * 100
  )

  if (posters.length === 0) {
    return null
  }

  const currentPoster = posters[currentIndex]

  return (
    <div
      className="min-w-[260px] flex-shrink-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image Container */}
      <div className="group relative w-full aspect-[210/297] rounded-xl bg-[#0a0a0a] overflow-hidden ring-1 ring-white/5 mb-4">
        {/* Clickable Overlay (z-35 is above image z-30 but below buttons z-40) */}
        <div 
          className="absolute inset-0 z-35 cursor-pointer"
          onClick={() => setPreviewOpen(true)}
        />

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-neutral-800/50 z-50 pointer-events-none">
          <div
            className="h-full bg-white transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current Image with slide */}
        <img
          key={currentIndex}
          src={currentPoster.imagePath || "/placeholder.jpg"}
          alt={currentPoster.title}
          className={`
            absolute inset-0 w-full h-full object-contain z-30
            transition-transform duration-300 ease-out
            ${sliding
              ? slideDirection === "left"
                ? "-translate-x-full"
                : "translate-x-full"
              : "translate-x-0"
            }
          `}
        />

        {/* Left Navigation Button */}
        {posters.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNavigation("prev") }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Previous poster"
          >
            ‹
          </button>
        )}

        {/* Right Navigation Button */}
        {posters.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNavigation("next") }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Next poster"
          >
            ›
          </button>
        )}

        {/* Discount Badge */}
        <div className="absolute top-3 right-3 z-40 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {discountPercent}% OFF
        </div>
      </div>

      {/* Poster Indicator Dots */}
      {posters.length > 1 && (
        <div className="flex justify-center gap-1.5 mb-3">
          {posters.map((_: any, i: number) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (i === currentIndex || sliding) return
                const dir = i > currentIndex ? "left" : "right"
                slideTo(i, dir)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "bg-white w-3"
                  : "bg-neutral-600 hover:bg-neutral-500"
              }`}
              aria-label={`Go to poster ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Collection Info Card */}
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-4 ring-1 ring-white/10">
        <h3 className="font-semibold text-sm leading-tight">
          {collection.title}
        </h3>

        <p className="text-xs text-white/60 mt-2">
          {posters.length} posters in this bundle
        </p>

        {collection.description && (
          <p className="text-xs text-white/50 mt-2 line-clamp-2">
            {collection.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="line-through text-xs text-white/50">
              ₹{collection.originalTotal}
            </span>
            <span className="text-lg font-semibold text-white">
              ₹{collection.discountedPrice}
            </span>
          </div>

          {/* CTA - Morphs between Add to Cart and Quantity Controls */}
          {quantity === 0 ? (
            <button
              onClick={() =>
                addToCart({
                  type: "collection",
                  id: collection.id,
                  title: collection.title,
                  price: collection.discountedPrice,
                  posterIds: collection.posterIds,
                  coverImage: posters[0]?.imagePath || "/posters/default-cover.jpg"
                })
              }
              className={`${buttons.primary} w-full`}
            >
              Add Bundle
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[#1a1a1a] p-2">
              <button
                onClick={() => decreaseQuantity(collection.id)}
                className="h-8 w-8 flex items-center justify-center rounded-md bg-[#111] text-white/70 hover:bg-[#222] transition"
              >
                −
              </button>

              <span
                key={quantity}
                className="flex-1 text-center text-sm font-semibold animate-pop"
              >
                {quantity}
              </span>

              <button
                onClick={() => increaseQuantity(collection.id)}
                className="h-8 w-8 flex items-center justify-center rounded-md bg-[#111] text-white/70 hover:bg-[#222] transition"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      <CollectionPreviewModal
        collection={collection}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}

