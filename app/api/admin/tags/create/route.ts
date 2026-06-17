export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { Timestamp } from "firebase-admin/firestore"
import { requireAdmin } from "@/lib/adminAuth"

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Tag required" }, { status: 400 })
    }

    // Sanitize tag name — used as Firestore doc ID, must be safe chars only
    const sanitizedName = String(name).trim().toLowerCase()
    if (!sanitizedName || !/^[a-z0-9 _-]+$/.test(sanitizedName)) {
      return NextResponse.json({ error: "Invalid tag name. Use only letters, numbers, spaces, hyphens, underscores." }, { status: 400 })
    }

    const db = getAdminDb()
    const tagRef = db.collection("tags").doc(sanitizedName)

    const existing = await tagRef.get()

    if (existing.exists) {
      return NextResponse.json({ error: "Tag exists" })
    }

    await tagRef.set({
      name: sanitizedName,
      createdAt: Timestamp.now(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Create tag error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
