"use client"

import { useEffect, useState } from "react"

interface Poster {
  id: string
  title: string
  price: number
  imagePath: string
}

interface Collection {
  id: string
  title: string
  description: string
  posterIds: string[]
  discountedPrice: number
  originalTotal: number
  coverImage?: string
  isActive?: boolean
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

  // Existing collections
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)

  // Edit modal state
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDiscountedPrice, setEditDiscountedPrice] = useState("")
  const [editSelectedPosters, setEditSelectedPosters] = useState<string[]>([])
  const [editLoading, setEditLoading] = useState(false)
  const [editMessage, setEditMessage] = useState("")

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch posters on mount
  useEffect(() => {
    fetch("/api/admin/posters")
      .then(res => res.json())
      .then(data => setPosters(data.posters || []))
      .catch(err => console.error("Failed to fetch posters:", err))
  }, [])

  // Fetch collections on mount
  const fetchCollections = () => {
    setCollectionsLoading(true)
    fetch("/api/admin/collections/list")
      .then(res => res.json())
      .then(data => setCollections(data.collections || []))
      .catch(err => console.error("Failed to fetch collections:", err))
      .finally(() => setCollectionsLoading(false))
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  // Toggle poster selection (create form)
  const togglePoster = (id: string) => {
    setSelectedPosters(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  // Toggle poster selection (edit form)
  const toggleEditPoster = (id: string) => {
    setEditSelectedPosters(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  // Calculate original total from selected posters
  const originalTotal = posters
    .filter(p => selectedPosters.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0)

  // Calculate edit original total
  const editOriginalTotal = posters
    .filter(p => editSelectedPosters.includes(p.id))
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
        fetchCollections()
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

  // Open edit modal
  const openEdit = (collection: Collection) => {
    setEditingCollection(collection)
    setEditTitle(collection.title)
    setEditDescription(collection.description || "")
    setEditDiscountedPrice(String(collection.discountedPrice))
    setEditSelectedPosters([...collection.posterIds])
    setEditMessage("")
  }

  // Save edited collection
  const saveEdit = async () => {
    if (!editingCollection) return

    if (!editTitle || editSelectedPosters.length < 2) {
      setEditMessage("Fill all fields and select at least 2 posters")
      return
    }

    if (!editDiscountedPrice || Number(editDiscountedPrice) >= editOriginalTotal) {
      setEditMessage("Discounted price must be less than original total")
      return
    }

    setEditLoading(true)
    setEditMessage("")

    try {
      const res = await fetch("/api/admin/collections/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          collectionId: editingCollection.id,
          title: editTitle,
          description: editDescription,
          posterIds: editSelectedPosters,
          discountedPrice: Number(editDiscountedPrice)
        })
      })

      const data = await res.json()

      if (data.success) {
        setEditMessage("✅ Collection updated successfully!")
        fetchCollections()
        setTimeout(() => {
          setEditingCollection(null)
        }, 1000)
      } else {
        setEditMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setEditMessage("❌ Failed to update collection")
      console.error(error)
    } finally {
      setEditLoading(false)
    }
  }

  // Delete collection
  const deleteCollection = async (collectionId: string) => {
    setDeletingId(collectionId)

    try {
      const res = await fetch("/api/admin/collections/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ collectionId })
      })

      const data = await res.json()

      if (data.success) {
        fetchCollections()
      }
    } catch (error) {
      console.error("Failed to delete collection:", error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Manage Collections
        </h1>
        <p className="text-white/60">
          Create, edit, and delete poster bundles with discount prices
        </p>
      </div>

      {/* ──────────────── Existing Collections ──────────────── */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Existing Collections</h2>

        {collectionsLoading ? (
          <div className="text-white/50 text-sm">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="text-white/40 text-sm p-6 border border-white/10 rounded-lg text-center">
            No collections yet. Create one below.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(collection => (
              <div
                key={collection.id}
                className="
                  bg-[#1a1a1a]
                  border
                  border-white/10
                  rounded-xl
                  p-5
                  transition-all
                  hover:border-white/20
                "
              >
                <h3 className="text-lg font-semibold mb-1 truncate">
                  {collection.title}
                </h3>

                {collection.description && (
                  <p className="text-sm text-white/50 mb-3 line-clamp-2">
                    {collection.description}
                  </p>
                )}

                <div className="text-sm text-white/60 mb-1">
                  {collection.posterIds?.length || 0} posters
                </div>

                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="text-white/40 line-through">
                    ₹{collection.originalTotal}
                  </span>
                  <span className="text-green-400 font-semibold">
                    ₹{collection.discountedPrice}
                  </span>
                  {collection.originalTotal > 0 && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      {Math.round((1 - collection.discountedPrice / collection.originalTotal) * 100)}% off
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(collection)}
                    className="
                      flex-1
                      bg-white
                      text-black
                      px-3 py-2
                      rounded-lg
                      text-sm
                      font-medium
                      hover:bg-white/90
                      transition
                    "
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCollection(collection.id)}
                    disabled={deletingId === collection.id}
                    className="
                      flex-1
                      bg-red-600/20
                      text-red-400
                      border
                      border-red-500/30
                      px-3 py-2
                      rounded-lg
                      text-sm
                      font-medium
                      hover:bg-red-600/30
                      transition
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    {deletingId === collection.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ──────────────── Create New Collection ──────────────── */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Create New Collection</h2>
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
              You&apos;re offering a {Math.round((1 - Number(discountedPrice) / originalTotal) * 100)}% discount
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

      {/* ──────────────── Edit Collection Modal ──────────────── */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setEditingCollection(null)}
          />

          {/* Modal */}
          <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 m-4 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setEditingCollection(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white text-2xl transition"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6">Edit Collection</h2>

            {/* Edit Title */}
            <div className="mb-6">
              <label className="text-sm font-medium text-white/70 block mb-2">
                Collection Title
              </label>
              <input
                type="text"
                placeholder="e.g. Cyberpunk Pack"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="
                  w-full
                  px-4 py-2.5
                  bg-black/40
                  border
                  border-white/10
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

            {/* Edit Description */}
            <div className="mb-6">
              <label className="text-sm font-medium text-white/70 block mb-2">
                Description (optional)
              </label>
              <textarea
                placeholder="What's in this collection?"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="
                  w-full
                  px-4 py-2.5
                  bg-black/40
                  border
                  border-white/10
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

            {/* Edit Poster Selection Grid */}
            <div className="mb-6">
              <label className="text-sm font-medium text-white/70 block mb-3">
                Select Posters (min 2)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {posters.map(poster => (
                  <div
                    key={poster.id}
                    onClick={() => toggleEditPoster(poster.id)}
                    className={`
                      cursor-pointer
                      border
                      rounded-lg
                      p-2.5
                      transition-all
                      ${editSelectedPosters.includes(poster.id)
                        ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/50"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                      }
                    `}
                  >
                    <img
                      src={poster.imagePath}
                      alt={poster.title}
                      className="w-full h-28 object-cover rounded mb-2"
                    />

                    <div className="text-xs font-medium truncate">
                      {poster.title}
                    </div>

                    <div className="text-xs text-white/60 mt-0.5">
                      ₹{poster.price}
                    </div>

                    {editSelectedPosters.includes(poster.id) && (
                      <div className="text-xs text-green-400 mt-1 font-semibold">
                        ✓ Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Pricing */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-medium text-white/70 block mb-2">
                  Original Total
                </label>
                <div className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white/80 font-medium">
                  ₹{editOriginalTotal}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 block mb-2">
                  Discounted Price
                </label>
                <input
                  type="number"
                  placeholder="e.g. 899"
                  value={editDiscountedPrice}
                  onChange={(e) => setEditDiscountedPrice(e.target.value)}
                  className="
                    w-full
                    px-4 py-2.5
                    bg-black/40
                    border
                    border-white/10
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

            {/* Edit Discount Badge Preview */}
            {editOriginalTotal > 0 && editDiscountedPrice && Number(editDiscountedPrice) < editOriginalTotal && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-400">
                  You&apos;re offering a {Math.round((1 - Number(editDiscountedPrice) / editOriginalTotal) * 100)}% discount
                </p>
              </div>
            )}

            {/* Edit Message */}
            {editMessage && (
              <div className={`mb-6 p-4 rounded-lg text-sm ${
                editMessage.startsWith("✅")
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}>
                {editMessage}
              </div>
            )}

            {/* Edit Actions */}
            <div className="flex gap-3">
              <button
                onClick={saveEdit}
                disabled={editLoading || editSelectedPosters.length < 2}
                className={`
                  flex-1
                  px-6 py-3
                  rounded-lg
                  font-medium
                  transition
                  ${editLoading || editSelectedPosters.length < 2
                    ? "bg-white/20 text-white/50 cursor-not-allowed"
                    : "bg-white text-black hover:bg-white/90"
                  }
                `}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={() => setEditingCollection(null)}
                className="
                  px-6 py-3
                  rounded-lg
                  font-medium
                  border
                  border-white/20
                  text-white/70
                  hover:bg-white/5
                  transition
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
