"use client"

import { useEffect, useState } from "react"
import CollectionCard from "./CollectionCard"

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
  coverImage: string
  isActive: boolean
  posters?: Poster[]
}

export default function CollectionsCarousel() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return null
  }

  if (collections.length === 0) {
    return null
  }

  return (
    <div className="mt-16 mb-16 border-t-8 border-black pt-16">
      <div className="mb-8 p-6 border-4 border-black shadow-[8px_8px_0_0_#A3FF12] bg-white inline-block">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">
          Collections
        </h2>
        <p className="font-bold border-2 border-black inline-block px-3 py-1 bg-[#A3FF12] text-black uppercase">
          Curated bundles with stacked poster previews
        </p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2">
        {collections.map(col => (
          <CollectionCard
            key={col.id}
            collection={col}
          />
        ))}
      </div>
    </div>
  )
}
