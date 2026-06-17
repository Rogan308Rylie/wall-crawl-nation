export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebaseAdmin";
import Razorpay from "razorpay";
import {
  sendCustomerOrderPlacedEmail,
  sendAdminNewOrderEmail,
} from "@/lib/email/orderEmails";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

    // Confirm the payment amount returned by Razorpay matches the order exactly
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.amount !== order.totalAmount * 100) {
      console.error(`CRITICAL ANOMALY: Payment amount mismatch for order ${orderId}. Expected ${order.totalAmount * 100}, got ${payment.amount}`);
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    // Optional cross-check: Ensure the razorpay order ID matches what we saved in create-order
    if (order.razorpay?.razorpay_order_id && order.razorpay.razorpay_order_id !== razorpay_order_id) {
      console.error(`CRITICAL ANOMALY: Order ID mismatch for order ${orderId}. Expected ${order.razorpay.razorpay_order_id}, got ${razorpay_order_id}`);
      return NextResponse.json({ error: "Razorpay order ID mismatch" }, { status: 400 });
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
