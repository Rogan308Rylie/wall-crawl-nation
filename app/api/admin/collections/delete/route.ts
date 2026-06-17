export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { requireAdmin } from "@/lib/adminAuth"

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const db = getAdminDb()

    const body = await req.json()

    const { collectionId } = body

    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      )
    }

    await db
      .collection("collections")
      .doc(collectionId)
      .delete()

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error("Collection delete error:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }
}
