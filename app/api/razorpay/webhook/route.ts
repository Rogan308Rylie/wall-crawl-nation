export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    // 1️⃣ Read raw body (Razorpay requires raw payload for signature)
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // 2️⃣ Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("❌ Webhook signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 3️⃣ Parse payload AFTER verification
    const payload = JSON.parse(rawBody);

    // We only care about successful payments
    if (payload.event !== "payment.captured") {
      return NextResponse.json({ ok: true });
    }

    const payment = payload.payload.payment.entity;
    const orderId = payment.notes?.orderId;

    if (!orderId) {
      console.warn("⚠️ orderId missing in webhook notes");
      return NextResponse.json({ ok: true });
    }

    const razorpay_payment_id = payment.id;
    const razorpay_order_id = payment.order_id;

    // 4️⃣ Idempotency guard
    const orderRef = getAdminDb().collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ ok: true });
    }

    const order = orderSnap.data();

    // 🚫 If already paid, ignore replay
    if (order?.paymentStatus === "paid") {
      console.log("⚠️ Webhook replay ignored:", orderId);
      return NextResponse.json({ ok: true });
    }

    // 5️⃣ Update order ONCE
    await orderRef.update({
      paymentStatus: "paid",
      status: "confirmed",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      razorpay: {
        razorpay_payment_id,
        razorpay_order_id,
      },
    });

    console.log("✅ Webhook processed:", orderId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    // Razorpay expects 200 even on internal errors (to avoid retries storm)
    return NextResponse.json({ ok: true });
  }
}
