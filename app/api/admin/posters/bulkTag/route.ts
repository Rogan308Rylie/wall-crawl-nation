export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { requireAdmin } from "@/lib/adminAuth"

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { posterIds, tag, action } = await req.json()

    if (!posterIds || !tag || !Array.isArray(posterIds)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Sanitize tag name
    const sanitizedTag = String(tag).trim().toLowerCase()
    if (!sanitizedTag || !/^[a-z0-9 _-]+$/.test(sanitizedTag)) {
      return NextResponse.json({ error: "Invalid tag name" }, { status: 400 })
    }

    const db = getAdminDb()

    await Promise.all(
      posterIds.map((id: string) => {
        if (action === "add") {
          return db
            .collection("posters")
            .doc(id)
            .update({
              tags: FieldValue.arrayUnion(sanitizedTag),
            })
        }

        if (action === "remove") {
          return db
            .collection("posters")
            .doc(id)
            .update({
              tags: FieldValue.arrayRemove(sanitizedTag),
            })
        }
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Bulk tag error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
