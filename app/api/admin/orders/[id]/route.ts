export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { sendOrderStatusEmail } from "@/lib/email/statusEmails";

// Allowed transitions (keep your business rules)
const allowedTransitions: Record<string, string[]> = {
  confirmed: ["packed"],
  packed: ["shipped"],
  shipped: ["delivered"],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Next.js 16
) {
  try {
    // 🔐 TOKEN-BASED AUTH (no cookies anywhere)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const db = getAdminDb();

    // 🔒 Admin check via Firestore (your existing schema)
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const nextStatus: string = body.status;

    if (!nextStatus) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const orderRef = db.collection("orders").doc(id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderSnap.data();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!order.deliveryAddress) {
      return NextResponse.json(
        { error: "Order missing delivery address" },
        { status: 400 },
      );
    }
    const currentStatus = order?.status;

    if (
      !allowedTransitions[currentStatus] ||
      !allowedTransitions[currentStatus].includes(nextStatus)
    ) {
      return NextResponse.json(
        { error: `Invalid transition from ${currentStatus} to ${nextStatus}` },
        { status: 400 },
      );
    }

    await orderRef.update({
      status: nextStatus,
      updatedAt: new Date(),
    });

    // 📧 SEND STATUS EMAIL (only for customer-facing statuses)
    const isStatusEmail =
      nextStatus === "packed" ||
      nextStatus === "shipped" ||
      nextStatus === "delivered";

    if (currentStatus !== nextStatus && isStatusEmail) {
      const SITE_URL =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      const orderForEmail = {
        id,
        email: order.deliveryAddress.email,
        name: order.deliveryAddress.fullName,
        totalAmount: order.totalAmount,
        items: order.items.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          imagePath: item.imagePath
            ? item.imagePath.startsWith("http") ? item.imagePath : `${SITE_URL}${item.imagePath}`
            : undefined,
        })),
      };

      try {
        await sendOrderStatusEmail(orderForEmail, nextStatus);
      } catch (emailErr) {
        console.error("STATUS EMAIL FAILED:", emailErr);
        // do NOT fail admin action
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
