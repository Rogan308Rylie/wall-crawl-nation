export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(req: NextRequest) {
  try {
    const { posterIds, tag, action } = await req.json()

    if (!posterIds || !tag) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const db = getAdminDb()

    await Promise.all(
      posterIds.map((id: string) => {
        if (action === "add") {
          return db
            .collection("posters")
            .doc(id)
            .update({
              tags: FieldValue.arrayUnion(tag),
            })
        }

        if (action === "remove") {
          return db
            .collection("posters")
            .doc(id)
            .update({
              tags: FieldValue.arrayRemove(tag),
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
