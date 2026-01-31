export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebaseAdmin";
import {
  sendCustomerOrderPlacedEmail,
  sendAdminNewOrderEmail,
} from "@/lib/email/orderEmails";

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
        { status: 400 },
      );
    }

    // 🔐 Verify Razorpay signature
    const signBody = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(signBody)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 🛑 Idempotency guard
    const adminDb = getAdminDb();
    const orderRef = adminDb.collection("orders").doc(orderId);
    const snap = await orderRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = snap.data();

    if (!order) {
      return NextResponse.json(
        { error: "Order data missing" },
        { status: 500 },
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: true });
    }

    // ✅ Mark order paid
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

    // 📧 PREPARE EMAIL DATA
    const orderData = {
  id: orderId,
  email: order.deliveryAddress.email,
  name: order.deliveryAddress.fullName,
  totalAmount: order.totalAmount,
  items: order.items, 
};


    // 📧 SEND EMAILS (NON-BLOCKING)
    try {
      await sendCustomerOrderPlacedEmail(orderData);
      await sendAdminNewOrderEmail(orderData);
    } catch (emailErr) {
      console.error("EMAIL SEND FAILED:", emailErr);
      // Do NOT fail the request because of email
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
