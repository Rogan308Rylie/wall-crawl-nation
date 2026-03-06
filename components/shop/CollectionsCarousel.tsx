"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/context/CartContext"

interface Collection {
  id: string
  title: string
  description?: string
  posterIds: string[]
  originalTotal: number
  discountedPrice: number
  coverImage: string
  isActive: boolean
}

export default function CollectionsCarousel() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())

  const { addToCart, cart } = useCart()

  useEffect(() => {
    fetch("/api/collections/list")
      .then(res => res.json())
      .then(data => {
        setCollections(data.collections || [])
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch collections:", err)
        setLoading(false)
      })
  }, [])

  const handleAddToCart = (collection: Collection) => {
    addToCart({
      type: "collection",
      id: collection.id,
      title: collection.title,
      price: collection.discountedPrice,
      posterIds: collection.posterIds,
      coverImage: collection.coverImage
    })

    setAddedItems(prev => new Set(prev).add(collection.id))

    setTimeout(() => {
      setAddedItems(prev => {
        const next = new Set(prev)
        next.delete(collection.id)
        return next
      })
    }, 1500)
  }

  if (loading) {
    return null
  }

  if (collections.length === 0) {
    return null
  }

  const discountPercent = (col: Collection) => {
    return Math.round((1 - col.discountedPrice / col.originalTotal) * 100)
  }

  return (
    <div className="mt-16 mb-16">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          Collections
        </h2>
        <p className="text-sm text-white/60">
          Curated bundles with amazing discounts
        </p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2">
        {collections.map(col => (
          <div
            key={col.id}
            className="
              min-w-[260px]
              flex-shrink-0
              bg-gradient-to-b
              from-[#1a1a1a]
              to-[#0f0f0f]
              rounded-xl
              overflow-hidden
              ring-1 ring-white/10
              hover:ring-white/20
              transition-all
              duration-300
              hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]
            "
          >
            {/* Cover Image */}
            <div className="relative h-40 bg-[#0a0a0a] overflow-hidden">
              <img
                src={col.coverImage}
                alt={col.title}
                className="w-full h-full object-cover"
              />

              {/* Discount Badge */}
              <div className="absolute top-3 right-3 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {discountPercent(col)}% OFF
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col h-full">
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  {col.title}
                </h3>

                <p className="text-xs text-white/60 mt-2">
                  {col.posterIds.length} posters included
                </p>

                {col.description && (
                  <p className="text-xs text-white/50 mt-2 line-clamp-2">
                    {col.description}
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="line-through text-xs text-white/50">
                    ₹{col.originalTotal}
                  </span>
                  <span className="text-lg font-semibold text-white">
                    ₹{col.discountedPrice}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(col)}
                  className={`
                    w-full
                    py-2
                    px-3
                    rounded-lg
                    text-sm
                    font-medium
                    transition-all
                    duration-300
                    ${addedItems.has(col.id)
                      ? "bg-green-600 text-white"
                      : "bg-white text-black hover:bg-white/90"
                    }
                  `}
                >
                  {addedItems.has(col.id) ? "✓ Added" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
