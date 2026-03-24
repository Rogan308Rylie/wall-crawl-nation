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
      <div className="mb-12 border-b-8 border-black pb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-black mb-4">
          Manage Collections
        </h1>
        <p className="text-xl font-bold uppercase text-black bg-[#A3FF12] inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_#000]">
          Create, edit, and delete poster bundles
        </p>
      </div>

      {/* ──────────────── Existing Collections ──────────────── */}
      <div className="mb-16">
        <h2 className="text-3xl font-black uppercase text-black tracking-widest border-b-4 border-black inline-block pb-2 mb-8">Existing Collections</h2>

        {collectionsLoading ? (
          <div className="text-black/50 text-xl font-bold uppercase">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="text-black/50 text-xl font-bold uppercase p-8 border-4 border-black bg-white shadow-[8px_8px_0_0_#A3FF12] text-center">
            No collections yet. Create one below.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map(collection => (
              <div
                key={collection.id}
                className="
                  bg-white
                  border-4
                  border-black
                  shadow-[8px_8px_0_0_#A3FF12]
                  p-6
                  transition-all
                  hover:-translate-y-1
                  hover:shadow-[12px_12px_0_0_#A3FF12]
                "
              >
                <h3 className="text-2xl font-black uppercase text-black mb-2 truncate">
                  {collection.title}
                </h3>

                {collection.description && (
                  <p className="text-lg font-bold text-black/60 mb-4 line-clamp-2 border-l-4 border-black pl-3">
                    {collection.description}
                  </p>
                )}

                <div className="text-lg font-black uppercase text-black mb-4">
                  <span className="bg-black text-[#A3FF12] px-2 py-1">{collection.posterIds?.length || 0} posters</span>
                </div>

                <div className="flex items-center gap-4 text-xl font-black mb-6 flex-wrap">
                  <span className="text-black/40 line-through">
                    ₹{collection.originalTotal}
                  </span>
                  <span className="text-black bg-[#A3FF12] px-3 border-2 border-black">
                    ₹{collection.discountedPrice}
                  </span>
                  {collection.originalTotal > 0 && (
                    <span className="text-sm border-2 border-black bg-white text-black px-2 py-1 uppercase">
                      {Math.round((1 - collection.discountedPrice / collection.originalTotal) * 100)}% off
                    </span>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => openEdit(collection)}
                    className="
                      flex-1
                      bg-white
                      text-black
                      border-4
                      border-black
                      px-4 py-3
                      text-lg
                      font-black
                      uppercase
                      hover:bg-[#A3FF12]
                      transition-colors
                    "
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCollection(collection.id)}
                    disabled={deletingId === collection.id}
                    className="
                      flex-1
                      bg-black
                      text-white
                      border-4
                      border-black
                      px-4 py-3
                      text-lg
                      font-black
                      uppercase
                      hover:text-red-500
                      transition-colors
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    {deletingId === collection.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ──────────────── Create New Collection ──────────────── */}
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase text-black tracking-widest border-b-4 border-black inline-block pb-2">Create New Collection</h2>
      </div>

      {/* Poster Selection Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-black uppercase text-black mb-6">Select Posters (min 2)</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {posters.map(poster => (
            <div
              key={poster.id}
              onClick={() => togglePoster(poster.id)}
              className={`
                cursor-pointer
                border-4
                p-4
                bg-white
                transition-all
                ${selectedPosters.includes(poster.id)
                  ? "border-black shadow-[8px_8px_0_0_#A3FF12] bg-[#f0f0f0]"
                  : "border-black shadow-[4px_4px_0_0_#000] hover:shadow-[8px_8px_0_0_#000]"
                }
              `}
            >
              <img
                src={poster.imagePath}
                alt={poster.title}
                className="w-full h-40 object-contain border-2 border-black mb-4 p-2 bg-white"
              />

              <div className="text-lg font-black uppercase text-black truncate mb-2">
                {poster.title}
              </div>

              <div className="text-md font-bold text-black border-2 border-black inline-block px-2 bg-[#A3FF12]">
                ₹{poster.price}
              </div>

              {selectedPosters.includes(poster.id) && (
                <div className="text-sm text-black bg-[#A3FF12] border-2 border-black mt-4 font-black uppercase px-2 py-1 text-center">
                  Selected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Collection Creator Panel */}
      <div className="bg-white p-8 border-4 border-black shadow-[12px_12px_0_0_#A3FF12] mb-12">
        <h2 className="text-2xl font-black uppercase text-black mb-8 border-b-4 border-black inline-block pb-2">Bundle Details</h2>

        {/* Title */}
        <div className="mb-6">
          <label className="text-lg font-black uppercase tracking-widest text-black block mb-3">
            Collection Title
          </label>
          <input
            type="text"
            placeholder="e.g. Cyberpunk Pack"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              w-full
              p-4
              bg-[#f0f0f0]
              border-4
              border-black
              text-black
              font-bold
              uppercase
              placeholder-black/50
              focus:bg-[#A3FF12]
              focus:outline-none
              transition-colors
            "
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="text-lg font-black uppercase tracking-widest text-black block mb-3">
            Description (optional)
          </label>
          <textarea
            placeholder="What's in this collection?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="
              w-full
              p-4
              bg-[#f0f0f0]
              border-4
              border-black
              text-black
              font-bold
              uppercase
              placeholder-black/50
              focus:bg-[#A3FF12]
              focus:outline-none
              transition-colors
              resize-none
              h-32
            "
          />
        </div>

        {/* Cover Image */}
        <div className="mb-8">
          <label className="text-lg font-black uppercase tracking-widest text-black block mb-3">
            Cover Image Path
          </label>
          <input
            type="text"
            placeholder="e.g. /posters/cyberpunk-cover.jpg"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="
              w-full
              p-4
              bg-[#f0f0f0]
              border-4
              border-black
              text-black
              font-bold
              uppercase
              placeholder-black/50
              focus:bg-[#A3FF12]
              focus:outline-none
              transition-colors
            "
          />
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-lg font-black uppercase tracking-widest text-black block mb-3">
              Original Total
            </label>
            <div className="p-4 bg-[#f0f0f0] border-4 border-black text-black font-bold text-xl uppercase">
              ₹{originalTotal}
            </div>
          </div>

          <div>
            <label className="text-lg font-black uppercase tracking-widest text-black block mb-3">
              Discounted Price
            </label>
            <input
              type="number"
              placeholder="e.g. 899"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              className="
                w-full
                p-4
                bg-[#f0f0f0]
                border-4
                border-black
                text-black
                font-bold
                uppercase
                placeholder-black/50
                focus:bg-[#A3FF12]
                focus:outline-none
                transition-colors
              "
            />
          </div>
        </div>

        {/* Discount Badge Preview */}
        {originalTotal > 0 && discountedPrice && Number(discountedPrice) < originalTotal && (
          <div className="mb-8 p-4 bg-[#A3FF12] border-4 border-black shadow-[4px_4px_0_0_#000]">
            <p className="text-xl font-bold text-black uppercase">
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
            py-6
            border-4
            border-black
            font-black
            text-2xl
            uppercase
            transition-all
            ${loading || selectedPosters.length < 2
              ? "bg-[#e0e0e0] text-black/40 cursor-not-allowed"
              : "bg-black text-[#A3FF12] hover:bg-white hover:text-black hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] shadow-[4px_4px_0_0_#000]"
            }
          `}
        >
          {loading ? "Creating..." : "Create Collection"}
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-white border-4 border-black shadow-[8px_8px_0_0_#A3FF12]">
        <p className="text-lg font-bold text-black uppercase">
          <span className="bg-[#A3FF12] border-2 border-black px-2 pb-1 mr-2">TIP</span> Select at least 2 posters, set a discount price lower than the original total, and click Create Collection.
        </p>
      </div>

      {/* ──────────────── Edit Collection Modal ──────────────── */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#A3FF12]/90 backdrop-blur-sm"
            onClick={() => setEditingCollection(null)}
          />

          {/* Modal */}
          <div className="relative bg-white border-8 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 m-4 shadow-[16px_16px_0_0_#000]">
            {/* Close button */}
            <button
              onClick={() => setEditingCollection(null)}
              className="absolute top-6 right-6 text-black hover:text-[#A3FF12] text-4xl font-black transition-colors"
            >
              ✕
            </button>

            <h2 className="text-4xl font-black uppercase text-black mb-10 border-b-8 border-black pb-4 inline-block">Edit Collection</h2>

            {/* Edit Title */}
            <div className="mb-6">
              <label className="text-lg font-black uppercase tracking-widest text-black block mb-3">
                Collection Title
              </label>
              <input
                type="text"
                placeholder="e.g. Cyberpunk Pack"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="
                  w-full
                  p-4
                  bg-[#f0f0f0]
                  border-4
                  border-black
                  text-black
                  font-bold
                  uppercase
                  placeholder-black/50
                  focus:bg-[#A3FF12]
                  focus:outline-none
                  transition-colors
                "
              />
            </div>

            {/* Edit Description */}
            <div className="mb-8">
              <label className="text-lg font-black uppercase tracking-widest text-black block mb-3">
                Description (optional)
              </label>
              <textarea
                placeholder="What's in this collection?"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="
                  w-full
                  p-4
                  bg-[#f0f0f0]
                  border-4
                  border-black
                  text-black
                  font-bold
                  uppercase
                  placeholder-black/50
                  focus:bg-[#A3FF12]
                  focus:outline-none
                  transition-colors
                  resize-none
                  h-32
                "
              />
            </div>

            {/* Edit Poster Selection Grid */}
            <div className="mb-8">
              <label className="text-lg font-black uppercase tracking-widest text-black block mb-4">
                Select Posters (min 2)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {posters.map(poster => (
                  <div
                    key={poster.id}
                    onClick={() => toggleEditPoster(poster.id)}
                    className={`
                      cursor-pointer
                      border-4
                      p-2
                      bg-white
                      transition-all
                      ${editSelectedPosters.includes(poster.id)
                        ? "border-black shadow-[4px_4px_0_0_#A3FF12] bg-[#f0f0f0]"
                        : "border-black shadow-none hover:shadow-[4px_4px_0_0_#000]"
                      }
                    `}
                  >
                    <img
                      src={poster.imagePath}
                      alt={poster.title}
                      className="w-full h-28 object-contain border-2 border-black mb-3 p-1 bg-white"
                    />

                    <div className="text-md font-black uppercase text-black truncate mb-1">
                      {poster.title}
                    </div>

                    <div className="text-sm font-bold text-black border-2 border-black px-1 inline-block bg-[#A3FF12]">
                      ₹{poster.price}
                    </div>

                    {editSelectedPosters.includes(poster.id) && (
                      <div className="text-xs text-black font-black uppercase tracking-widest bg-[#A3FF12] border-2 border-black px-1 mt-2 mb-1 text-center">
                        Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Pricing */}
            <div className="grid grid-cols-2 gap-6 mb-8 mt-8 border-t-4 border-black pt-8">
              <div>
                <label className="text-lg font-black uppercase tracking-widest text-black block mb-3">
                  Original Total
                </label>
                <div className="p-4 bg-[#f0f0f0] border-4 border-black text-black font-bold text-xl uppercase">
                  ₹{editOriginalTotal}
                </div>
              </div>

              <div>
                <label className="text-lg font-black uppercase tracking-widest text-black block mb-3">
                  Discounted Price
                </label>
                <input
                  type="number"
                  placeholder="e.g. 899"
                  value={editDiscountedPrice}
                  onChange={(e) => setEditDiscountedPrice(e.target.value)}
                  className="
                    w-full
                    p-4
                    bg-[#f0f0f0]
                    border-4
                    border-black
                    text-black
                    font-bold
                    uppercase
                    placeholder-black/50
                    focus:bg-[#A3FF12]
                    focus:outline-none
                    transition-colors
                  "
                />
              </div>
            </div>

            {/* Edit Discount Badge Preview */}
            {editOriginalTotal > 0 && editDiscountedPrice && Number(editDiscountedPrice) < editOriginalTotal && (
              <div className="mb-8 p-4 bg-[#A3FF12] border-4 border-black shadow-[4px_4px_0_0_#000]">
                <p className="text-xl font-bold text-black uppercase">
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
            <div className="flex gap-4 border-t-8 border-black pt-8 mt-8">
              <button
                onClick={saveEdit}
                disabled={editLoading || editSelectedPosters.length < 2}
                className={`
                  flex-1
                  py-4
                  border-4
                  border-black
                  font-black
                  text-xl
                  uppercase
                  transition-all
                  ${editLoading || editSelectedPosters.length < 2
                    ? "bg-[#e0e0e0] text-black/40 cursor-not-allowed"
                    : "bg-black text-[#A3FF12] hover:bg-white hover:text-black hover:-translate-y-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]"
                  }
                `}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={() => setEditingCollection(null)}
                className="
                  flex-1
                  py-4
                  border-4
                  border-black
                  font-black
                  text-xl
                  uppercase
                  bg-white
                  text-black
                  hover:-translate-y-1 
                  shadow-[4px_4px_0_0_#000] 
                  hover:shadow-[6px_6px_0_0_#000]
                  transition-all
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
