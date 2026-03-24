"use client"

import { useCart } from "@/context/CartContext"
import { buttons } from "@/lib/ui/buttons"

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
    <div className="fixed inset-0 z-50 bg-[#A3FF12]/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border-8 border-black w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 relative shadow-[16px_16px_0_0_#000]" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-4xl text-black hover:text-[#A3FF12] transition font-black hover:scale-110"
          aria-label="Close preview"
        >
          ✕
        </button>

        {/* Posters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12">
          {posters.map((poster) => (
            <div key={poster.id} className="group border-4 border-black p-2 bg-[#f0f0f0] shadow-[8px_8px_0_0_#A3FF12] hover:shadow-[12px_12px_0_0_#A3FF12] transition-shadow">
              <img
                src={poster.imagePath}
                alt={poster.title}
                className="w-full border-4 border-black cursor-zoom-in transition transform group-hover:scale-[1.02]"
              />
              <div className="mt-4 text-lg font-black uppercase text-black">
                {poster.title}
              </div>
            </div>
          ))}
        </div>

        {/* Bundle Info Section */}
        <div className="mt-16 border-t-8 border-black pt-8">
          <h2 className="text-4xl font-black uppercase text-black line-clamp-1">
            {collection.title}
          </h2>

          <div className="mt-4 text-lg font-bold bg-black text-[#A3FF12] inline-block px-3 py-1 uppercase shadow-[4px_4px_0_0_#A3FF12]">
            {posters.length} posters in this bundle
          </div>

          {collection.description && (
            <p className="mt-6 text-xl font-bold text-black max-w-2xl border-l-4 border-black pl-4">
              {collection.description}
            </p>
          )}

          {/* Bundle Savings Display */}
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <span className="line-through text-black/50 text-2xl font-black">
              ₹{collection.originalTotal}
            </span>

            <span className="text-4xl font-black text-black bg-[#A3FF12] px-4 py-2 border-4 border-black shadow-[6px_6px_0_0_#000]">
              ₹{collection.discountedPrice}
            </span>

            <span className="text-xl font-black uppercase text-black border-4 border-black inline-block px-3 py-1 bg-white shadow-[4px_4px_0_0_#A3FF12]">
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
            className={`${buttons.primary} mt-6`}
          >
            Add Bundle to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
