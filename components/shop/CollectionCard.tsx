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
      <div className="group relative w-full aspect-[210/297] bg-[#f0f0f0] overflow-hidden border-4 border-black mb-4">
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
            data-cursor="hover"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200"
            aria-label="Previous poster"
          >
            ‹
          </button>
        )}

        {/* Right Navigation Button */}
        {posters.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNavigation("next") }}
            data-cursor="hover"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200"
            aria-label="Next poster"
          >
            ›
          </button>
        )}

        {/* Discount Badge */}
        <div className="absolute top-2 right-2 z-40 bg-[#A3FF12] border-2 border-black text-black px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-sm font-black uppercase shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000]">
          {discountPercent}% OFF
        </div>
      </div>

      {/* Poster Indicator Dots */}
      {posters.length > 1 && (
        <div className="flex justify-center gap-2 mb-4">
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
              className={`w-3 h-3 border-2 border-black transition-all ${
                i === currentIndex
                  ? "bg-[#A3FF12] w-6"
                  : "bg-white hover:bg-black"
              }`}
              aria-label={`Go to poster ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Collection Info Card */}
      <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0_0_#A3FF12]">
        <h3 className="font-black text-lg sm:text-xl uppercase leading-tight text-black">
          {collection.title}
        </h3>
        <p className="text-[9px] sm:text-sm font-bold text-[#A3FF12] border-2 border-black inline-block px-1.5 sm:px-2 py-0.5 mt-2 bg-black uppercase">
          {posters.length} posters in this bundle
        </p>

        {collection.description && (
          <p className="text-sm font-bold text-black mt-4 border-l-4 border-black pl-3 line-clamp-2">
            {collection.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-6 pt-4 border-t-4 border-black">
          <div className="flex items-center gap-3 mb-4">
            <span className="line-through text-[10px] sm:text-sm font-black text-black/50">
              ₹{collection.originalTotal}
            </span>
            <span className="text-lg sm:text-2xl font-black text-black bg-[#A3FF12] px-2 py-1 border-2 border-black shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000]">
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
            <div className="flex items-center justify-between gap-2 border-4 border-black bg-white p-2">
              <button
                onClick={() => decreaseQuantity(collection.id)}
                className="h-8 sm:h-10 w-8 sm:w-10 flex items-center justify-center border-2 border-black bg-[#A3FF12] text-black font-black text-lg sm:text-xl hover:bg-black hover:text-[#A3FF12] transition-colors"
              >
                −
              </button>

              <span
                key={quantity}
                className="flex-1 text-center text-xl font-black text-black animate-pop"
              >
                {quantity}
              </span>

               <button
                onClick={() => increaseQuantity(collection.id)}
                className="h-8 sm:h-10 w-8 sm:w-10 flex items-center justify-center border-2 border-black bg-[#A3FF12] text-black font-black text-lg sm:text-xl hover:bg-black hover:text-[#A3FF12] transition-colors"
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

