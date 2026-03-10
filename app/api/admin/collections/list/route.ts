export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function GET() {
  try {
    const db = getAdminDb()
    const snapshot = await db.collection("collections").get()

    const collections = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ collections })
  } catch (error) {
    console.error("Failed to fetch collections:", error)
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    )
  }
}
