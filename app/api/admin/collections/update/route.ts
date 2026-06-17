export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { Timestamp } from "firebase-admin/firestore"
import { requireAdmin } from "@/lib/adminAuth"

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const db = getAdminDb()

    const body = await req.json()

    const {
      collectionId,
      title,
      description,
      posterIds,
      discountedPrice
    } = body

    if (!collectionId || !posterIds || posterIds.length < 2) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      )
    }

    const posterDocs = await Promise.all(
      posterIds.map((id: string) =>
        db.collection("posters").doc(id).get()
      )
    )

    let originalTotal = 0

    for (const doc of posterDocs) {
      if (!doc.exists) {
        return NextResponse.json(
          { error: "Poster not found" },
          { status: 400 }
        )
      }

      const poster = doc.data()

      originalTotal += poster?.price || 0
    }

    if (discountedPrice >= originalTotal) {
      return NextResponse.json(
        { error: "Discount must be less than original price" },
        { status: 400 }
      )
    }

    await db
      .collection("collections")
      .doc(collectionId)
      .update({
        title,
        description,
        posterIds,
        discountedPrice,
        originalTotal,
        updatedAt: Timestamp.now()
      })

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error("Collection update error:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }
}
