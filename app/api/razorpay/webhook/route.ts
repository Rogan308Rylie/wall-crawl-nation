// import { NextResponse } from "next/server";
// import crypto from "crypto";
// import { adminDb } from "@/lib/firebaseAdmin";

// export const runtime = "nodejs"; // IMPORTANT for crypto

// export async function POST(req: Request) {
//   try {
//     const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

//     if (!webhookSecret) {
//       throw new Error("Missing RAZORPAY_WEBHOOK_SECRET");
//     }

//     const body = await req.text();
//     const signature = req.headers.get("x-razorpay-signature");

//     if (!signature) {
//       return NextResponse.json(
//         { error: "Missing Razorpay signature" },
//         { status: 400 }
//       );
//     }

//     // Verify signature
//     const expectedSignature = crypto
//       .createHmac("sha256", webhookSecret)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== signature) {
//       return NextResponse.json(
//         { error: "Invalid signature" },
//         { status: 401 }
//       );
//     }

//     const event = JSON.parse(body);

//     // We care mainly about successful payments
//     if (event.event === "payment.captured") {
//       const payment = event.payload.payment.entity;
//       const razorpayOrderId = payment.order_id;

//       // Find order by razorpay_order_id
//       const snapshot = await adminDb
//         .collection("orders")
//         .where("razorpay.razorpay_order_id", "==", razorpayOrderId)
//         .limit(1)
//         .get();

//       if (!snapshot.empty) {
//         const doc = snapshot.docs[0];

//         await doc.ref.update({
//           status: "confirmed",
//           paymentStatus: "paid",
//           paidAt: new Date(),
//         });
//       }
//     }

//     return NextResponse.json({ received: true });
//   } catch (err) {
//     console.error("Razorpay webhook error:", err);
//     return NextResponse.json(
//       { error: "Webhook processing failed" },
//       { status: 500 }
//     );
//   }
// }
export const runtime = "nodejs";

export async function POST() {
  return new Response("ok", { status: 200 });
}

export {};
