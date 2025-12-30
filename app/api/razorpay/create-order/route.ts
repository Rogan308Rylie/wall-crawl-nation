export const runtime = "nodejs";

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, orderId } = body;

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "amount and orderId are required" },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: orderId,
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

console.log("KEY ID:", !!process.env.RAZORPAY_KEY_ID);
console.log("KEY SECRET:", !!process.env.RAZORPAY_KEY_SECRET);
