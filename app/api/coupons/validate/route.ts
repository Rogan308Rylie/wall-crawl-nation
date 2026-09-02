export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: "Missing coupon code" }, { status: 400 })
    }

    const db = getAdminDb()
    const snapshot = await db.collection("coupons").where("code", "==", code.toUpperCase()).get()

    if (snapshot.empty) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    const couponDoc = snapshot.docs[0]
    const couponData = couponDoc.data()

    if (!couponData.isActive) {
      return NextResponse.json({ error: "Coupon is no longer active" }, { status: 400 })
    }

    if (couponData.maxUses && couponData.usedCount >= couponData.maxUses) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: couponData.code,
        type: couponData.type,
        value: couponData.value
      }
    })
  } catch (error) {
    console.error("Failed to validate coupon:", error)
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    )
  }
}
