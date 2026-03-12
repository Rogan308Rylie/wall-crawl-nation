export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function POST(req: NextRequest) {
  try {
    const { posterId, tags } = await req.json()

    if (!posterId) {
      return NextResponse.json(
        { error: "Poster ID required" },
        { status: 400 }
      )
    }

    const db = getAdminDb()

    await db.collection("posters").doc(posterId).update({ tags })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update poster tags error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
