export interface Collection {
  id?: string

  title: string
  description?: string

  posterIds: string[]        // posters included in bundle

  originalTotal: number      // sum of poster prices
  discountedPrice: number    // bundle price

  coverImage: string         // image for carousel card

  isActive: boolean

  createdAt: any
  updatedAt?: any
}