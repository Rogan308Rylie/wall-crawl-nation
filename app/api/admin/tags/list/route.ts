export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { requireAdmin } from "@/lib/adminAuth"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const db = getAdminDb()
    const snapshot = await db.collection("tags").get()

    const tags = snapshot.docs.map((doc) => doc.data().name)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("List tags error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
