export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as crypto from "crypto";
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

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
    console.log("📝 Updating order via Admin SDK:", orderId);

    await adminDb.collection("orders").doc(orderId).update({
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
