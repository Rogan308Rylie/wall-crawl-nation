export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { requireAdmin } from "@/lib/adminAuth"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const db = getAdminDb()
    const snapshot = await db.collection("coupons").get()

    const coupons = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error("Failed to fetch coupons:", error)
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    )
  }
}
