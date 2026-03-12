export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { Timestamp } from "firebase-admin/firestore"

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Tag required" }, { status: 400 })
    }

    const db = getAdminDb()
    const tagRef = db.collection("tags").doc(name)

    const existing = await tagRef.get()

    if (existing.exists) {
      return NextResponse.json({ error: "Tag exists" })
    }

    await tagRef.set({
      name,
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
