export const runtime = "nodejs";

import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data()!;

    if (orderData.userId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (orderData.paymentStatus !== "created") {
      return NextResponse.json({ error: "Order cannot be paid" }, { status: 400 });
    }

    const serverAmount = orderData.totalAmount;

    if (typeof serverAmount !== "number" || serverAmount <= 0 || !Number.isFinite(serverAmount)) {
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 500 }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: serverAmount * 100,
      currency: "INR",
      receipt: orderId,
    });

    // Store the Razorpay order ID back on the Firestore order doc
    await orderRef.update({
      "razorpay.razorpay_order_id": razorpayOrder.id
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
