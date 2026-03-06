"use client"

import { useEffect, useState } from "react"

interface Poster {
  id: string
  title: string
  price: number
  imagePath: string
}

export default function AdminCollectionsPage() {
  const [posters, setPosters] = useState<Poster[]>([])
  const [selectedPosters, setSelectedPosters] = useState<string[]>([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [discountedPrice, setDiscountedPrice] = useState("")
  const [coverImage, setCoverImage] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Fetch posters on mount
  useEffect(() => {
    fetch("/api/admin/posters")
      .then(res => res.json())
      .then(data => setPosters(data.posters || []))
      .catch(err => console.error("Failed to fetch posters:", err))
  }, [])

  // Toggle poster selection
  const togglePoster = (id: string) => {
    setSelectedPosters(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  // Calculate original total from selected posters
  const originalTotal = posters
    .filter(p => selectedPosters.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0)

  // Create collection
  const createCollection = async () => {
    if (!title || selectedPosters.length < 2) {
      setMessage("Fill all fields and select at least 2 posters")
      return
    }

    if (!discountedPrice || Number(discountedPrice) >= originalTotal) {
      setMessage("Discounted price must be less than original total")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/admin/collections/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          posterIds: selectedPosters,
          discountedPrice: Number(discountedPrice),
          coverImage
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage("✅ Collection created successfully!")
        setTitle("")
        setDescription("")
        setDiscountedPrice("")
        setCoverImage("")
        setSelectedPosters([])
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage("❌ Failed to create collection")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Create Collections
        </h1>
        <p className="text-white/60">
          Bundle posters together and set discount prices
        </p>
      </div>

      {/* Poster Selection Grid */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Select Posters (min 2)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posters.map(poster => (
            <div
              key={poster.id}
              onClick={() => togglePoster(poster.id)}
              className={`
                cursor-pointer
                border
                rounded-lg
                p-3
                transition-all
                ${selectedPosters.includes(poster.id)
                  ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/50"
                  : "border-white/20 bg-white/5 hover:border-white/40"
                }
              `}
            >
              <img
                src={poster.imagePath}
                alt={poster.title}
                className="w-full h-40 object-cover rounded mb-3"
              />

              <div className="text-sm font-medium truncate">
                {poster.title}
              </div>

              <div className="text-xs text-white/60 mt-1">
                ₹{poster.price}
              </div>

              {selectedPosters.includes(poster.id) && (
                <div className="text-xs text-green-400 mt-2 font-semibold">
                  ✓ Selected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Collection Creator Panel */}
      <div className="bg-[#1a1a1a] p-8 rounded-xl ring-1 ring-white/10">
        <h2 className="text-lg font-semibold mb-6">Bundle Details</h2>

        {/* Title */}
        <div className="mb-6">
          <label className="text-sm font-medium text-white/70 block mb-2">
            Collection Title
          </label>
          <input
            type="text"
            placeholder="e.g. Cyberpunk Pack"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              w-full
              px-4 py-2.5
              bg-black/40
              border
              border-white/20
              rounded-lg
              text-white
              placeholder:text-white/40
              focus:outline-none
              focus:border-white/40
              focus:ring-1
              focus:ring-white/20
              transition
            "
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="text-sm font-medium text-white/70 block mb-2">
            Description (optional)
          </label>
          <textarea
            placeholder="What's in this collection?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="
              w-full
              px-4 py-2.5
              bg-black/40
              border
              border-white/20
              rounded-lg
              text-white
              placeholder:text-white/40
              focus:outline-none
              focus:border-white/40
              focus:ring-1
              focus:ring-white/20
              transition
              resize-none
              h-24
            "
          />
        </div>

        {/* Cover Image */}
        <div className="mb-6">
          <label className="text-sm font-medium text-white/70 block mb-2">
            Cover Image Path
          </label>
          <input
            type="text"
            placeholder="e.g. /posters/cyberpunk-cover.jpg"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="
              w-full
              px-4 py-2.5
              bg-black/40
              border
              border-white/20
              rounded-lg
              text-white
              placeholder:text-white/40
              focus:outline-none
              focus:border-white/40
              focus:ring-1
              focus:ring-white/20
              transition
            "
          />
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-white/70 block mb-2">
              Original Total
            </label>
            <div className="px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white/80 font-medium">
              ₹{originalTotal}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white/70 block mb-2">
              Discounted Price
            </label>
            <input
              type="number"
              placeholder="e.g. 899"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              className="
                w-full
                px-4 py-2.5
                bg-black/40
                border
                border-white/20
                rounded-lg
                text-white
                placeholder:text-white/40
                focus:outline-none
                focus:border-white/40
                focus:ring-1
                focus:ring-white/20
                transition
              "
            />
          </div>
        </div>

        {/* Discount Badge Preview */}
        {originalTotal > 0 && discountedPrice && Number(discountedPrice) < originalTotal && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">
              You're offering a {Math.round((1 - Number(discountedPrice) / originalTotal) * 100)}% discount
            </p>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.startsWith("✅")
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={createCollection}
          disabled={loading || selectedPosters.length < 2}
          className={`
            w-full
            px-6 py-3
            rounded-lg
            font-medium
            transition
            ${loading || selectedPosters.length < 2
              ? "bg-white/20 text-white/50 cursor-not-allowed"
              : "bg-white text-black hover:bg-white/90"
            }
          `}
        >
          {loading ? "Creating..." : "Create Collection"}
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Select at least 2 posters, set a discount price lower than the original total, and click Create Collection.
        </p>
      </div>
    </div>
  )
}
