export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { requireAdmin } from "@/lib/adminAuth"

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { id, type, value, maxUses, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "Missing coupon ID" }, { status: 400 })
    }

    const db = getAdminDb()
    
    const updateData: any = {}
    if (type !== undefined) updateData.type = type
    if (value !== undefined) updateData.value = Number(value)
    if (maxUses !== undefined) updateData.maxUses = maxUses === null ? null : Number(maxUses)
    if (isActive !== undefined) updateData.isActive = isActive

    await db.collection("coupons").doc(id).update(updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update coupon:", error)
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    )
  }
}
