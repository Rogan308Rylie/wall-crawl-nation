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
      title,
      description,
      posterIds,
      discountedPrice,
      coverImage
    } = body


    if (!title || !posterIds || posterIds.length < 2) {
      return NextResponse.json(
        { error: "Invalid collection data" },
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

      if (!poster?.price) {
        return NextResponse.json(
          { error: "Invalid poster price" },
          { status: 400 }
        )
      }

      originalTotal += poster.price
    }

    if (discountedPrice >= originalTotal) {
      return NextResponse.json(
        { error: "Discount must be less than original price" },
        { status: 400 }
      )
    }

    const collectionRef = await db.collection("collections").add({
      title,
      description: description || "",
      posterIds,
      originalTotal,
      discountedPrice,
      coverImage,
      isActive: true,
      createdAt: Timestamp.now()
    })

    return NextResponse.json({
      success: true,
      id: collectionRef.id
    })
  } catch (error) {
    console.error("Collection creation error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
