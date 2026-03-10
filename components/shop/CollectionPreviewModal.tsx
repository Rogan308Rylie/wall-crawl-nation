"use client"

import { useCart } from "@/context/CartContext"

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

  if (!open) return null

  const posters = collection.posters || []
  const savings = collection.originalTotal - collection.discountedPrice

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-white/70 hover:text-white transition"
          aria-label="Close preview"
        >
          ✕
        </button>

        {/* Posters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {posters.map((poster) => (
            <div key={poster.id} className="group">
              <img
                src={poster.imagePath}
                alt={poster.title}
                className="w-full rounded-lg cursor-zoom-in transition transform group-hover:scale-105"
              />
              <div className="mt-2 text-sm opacity-70">
                {poster.title}
              </div>
            </div>
          ))}
        </div>

        {/* Bundle Info Section */}
        <div className="mt-10 border-t border-neutral-800 pt-6">
          <h2 className="text-2xl font-semibold">
            {collection.title}
          </h2>

          <div className="mt-2 opacity-70">
            {posters.length} posters in this bundle
          </div>

          {collection.description && (
            <p className="mt-3 text-sm opacity-60 max-w-2xl">
              {collection.description}
            </p>
          )}

          {/* Bundle Savings Display */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="line-through text-neutral-400 text-lg">
              ₹{collection.originalTotal}
            </span>

            <span className="text-3xl font-bold">
              ₹{collection.discountedPrice}
            </span>

            <span className="text-green-400 font-semibold">
              Save ₹{savings}
            </span>
          </div>

          {/* Add Bundle Button */}
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
            className="mt-6 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition"
          >
            Add Bundle to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
