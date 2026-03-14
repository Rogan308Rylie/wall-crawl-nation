export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Tag name required" }, { status: 400 })
    }

    const db = getAdminDb()
    const tagRef = db.collection("tags").doc(name)

    const existing = await tagRef.get()

    if (!existing.exists) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    await tagRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete tag error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
