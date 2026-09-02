export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"
import { requireAdmin } from "@/lib/adminAuth"

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { code, type, value, maxUses, isActive } = body

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = getAdminDb()
    
    // Check if code already exists
    const existingCoupon = await db.collection("coupons").where("code", "==", code.toUpperCase()).get()
    if (!existingCoupon.empty) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    const couponData = {
      code: code.toUpperCase(),
      type,
      value: Number(value),
      maxUses: maxUses ? Number(maxUses) : null,
      usedCount: 0,
      isActive: isActive ?? true,
      createdAt: new Date().toISOString(),
    }

    const docRef = await db.collection("coupons").add(couponData)

    return NextResponse.json({ success: true, id: docRef.id, ...couponData })
  } catch (error) {
    console.error("Failed to create coupon:", error)
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    )
  }
}
