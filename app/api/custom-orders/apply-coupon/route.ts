export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { customOrderId, couponCode } = await req.json();

    if (!customOrderId || !couponCode) {
      return NextResponse.json({ error: "Missing customOrderId or couponCode" }, { status: 400 });
    }

    const db = getAdminDb();
    
    // 1. Fetch the custom order
    const customOrderRef = db.collection("customOrders").doc(customOrderId);
    const customOrderSnap = await customOrderRef.get();
    
    if (!customOrderSnap.exists) {
      return NextResponse.json({ error: "Custom order not found" }, { status: 404 });
    }

    const customOrderData = customOrderSnap.data()!;
    const originalPrice = customOrderData.originalPrice || (customOrderData.totalImages * customOrderData.pricePerImage);
    let totalPrice = originalPrice;
    let discountApplied = 0;

    // 2. Fetch the coupon
    const couponSnap = await db.collection("coupons").where("code", "==", couponCode.toUpperCase()).get();
    
    if (couponSnap.empty) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const couponData = couponSnap.docs[0].data();
    
    // 3. Validate coupon
    if (!couponData.isActive || (couponData.maxUses && couponData.usedCount >= couponData.maxUses)) {
      return NextResponse.json({ error: "Coupon is inactive or usage limit reached" }, { status: 400 });
    }

    // 4. Calculate discount
    if (couponData.type === "percentage") {
      discountApplied = Math.floor(originalPrice * (couponData.value / 100));
    } else {
      discountApplied = couponData.value;
    }
    
    // Ensure total price doesn't go negative
    totalPrice = Math.max(0, originalPrice - discountApplied);

    // 5. Update custom order in DB
    await customOrderRef.update({
      totalPrice,
      discountApplied,
      couponCode: couponCode.toUpperCase(),
    });

    return NextResponse.json({
      success: true,
      totalPrice,
      originalPrice,
      discountApplied,
      couponCode: couponCode.toUpperCase(),
      coupon: {
        code: couponData.code,
        type: couponData.type,
        value: couponData.value
      }
    });

  } catch (error) {
    console.error("Failed to apply coupon:", error);
    return NextResponse.json({ error: "Failed to apply coupon" }, { status: 500 });
  }
}
