export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function GET() {
  try {
    const adminDb = getAdminDb()
    const snapshot = await adminDb
      .collection("collections")
      .where("isActive", "==", true)
      .get()

    const collections = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data()

        // Fetch poster details for each poster ID
        const posters = await Promise.all(
          (data.posterIds || []).map(async (posterId: string) => {
            try {
              const posterDoc = await adminDb
                .collection("posters")
                .doc(posterId)
                .get()

              if (posterDoc.exists) {
                return {
                  id: posterDoc.id,
                  ...posterDoc.data()
                }
              }
              return null
            } catch (err) {
              console.error(`Failed to fetch poster ${posterId}:`, err)
              return null
            }
          })
        )

        // Filter out null posters
        const validPosters = posters.filter((p) => p !== null)

        return {
          id: doc.id,
          ...data,
          posters: validPosters
        }
      })
    )

    return NextResponse.json({ collections })
  } catch (error) {
    console.error("Failed to fetch collections:", error)
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    )
  }
}
