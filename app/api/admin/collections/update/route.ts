export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin"
import { Timestamp } from "firebase-admin/firestore"

export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get("__session")?.value

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const auth = getAdminAuth()
    const decoded = await auth.verifySessionCookie(session)

    const db = getAdminDb()
    const userDoc = await db.collection("users").doc(decoded.uid).get()

    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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
