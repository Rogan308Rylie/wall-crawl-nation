import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ received: true });
    }

    // 1️⃣ Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ received: true });
    }

    const payload = JSON.parse(bodyText);

    // 2️⃣ Extract payment info safely
    const paymentEntity = payload?.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ received: true });
    }

    // 3️⃣ Find order by razorpayOrderId
    const snapshot = await getAdminDb()
      .collection("orders")
      .where("razorpayOrderId", "==", razorpayOrderId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // Order not found — ACK webhook anyway
      return NextResponse.json({ received: true });
    }

    const orderRef = snapshot.docs[0].ref;
    const orderData = snapshot.docs[0].data();

    // 4️⃣ IDEMPOTENCY CHECK
    if (orderData.status === "paid") {
      return NextResponse.json({ received: true });
    }

    // 5️⃣ Mark order as PAID (webhook confirmation)
    await orderRef.update({
      status: "paid",
      razorpayPaymentId,
      paidAt: FieldValue.serverTimestamp(),
    });

    // 6️⃣ Always ACK webhook
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("razorpay webhook error:", err);
    // Never fail a webhook — Razorpay retries aggressively
    return NextResponse.json({ received: true });
  }
}
