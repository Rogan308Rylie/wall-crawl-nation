export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as crypto from "crypto";
import admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // 🔐 STEP 1: Verify Razorpay signature
    const signBody = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(signBody)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch");
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    console.log("✅ Razorpay signature verified");

    // 📝 STEP 2: Update order using Admin SDK (bypasses rules)
    // 🔒 STEP 2.5: Fetch order & prevent double verification
    const orderRef = getAdminDb().collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderSnap.data();

    // 🚫 HARD LOCK: block re-processing
    if (order?.status !== "created") {
      return NextResponse.json(
        { error: "Order already processed" },
        { status: 409 }
      );
    }

    console.log("📝 Updating order via Admin SDK:", orderId);

    await orderRef.update({
      paymentStatus: "paid",
      status: "confirmed",
      razorpay: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Order marked paid in Firestore");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Verify-payment failed:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}