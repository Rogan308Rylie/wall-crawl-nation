export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { requireAdmin } from "@/lib/adminAuth"

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { posterId, tags } = await req.json()

    if (!posterId) {
      return NextResponse.json(
        { error: "Poster ID required" },
        { status: 400 }
      )
    }

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Tags must be an array" },
        { status: 400 }
      )
    }

    // Sanitize each tag
    const sanitizedTags: string[] = tags
      .map((t: unknown) => String(t).trim().toLowerCase())
      .filter((t) => /^[a-z0-9 _-]+$/.test(t))

    const db = getAdminDb()

    await db.collection("posters").doc(posterId).update({ tags: sanitizedTags })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update poster tags error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
