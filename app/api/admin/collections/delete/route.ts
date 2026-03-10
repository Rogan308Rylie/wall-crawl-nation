export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin"

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
