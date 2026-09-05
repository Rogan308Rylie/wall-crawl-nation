export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { sendOrderStatusEmail } from "@/lib/email/statusEmails";
import { requireAdmin } from "@/lib/adminAuth";

// Allowed transitions for admin
const allowedTransitions: Record<string, string[]> = {
  pending: ["confirmed", "packed", "shipped", "delivered", "completed", "cancelled"],
  confirmed: ["pending", "packed", "shipped", "delivered", "completed", "cancelled"],
  packed: ["confirmed", "shipped", "delivered", "completed", "cancelled"],
  shipped: ["packed", "delivered", "completed", "cancelled"],
  delivered: ["confirmed", "packed", "shipped", "completed", "cancelled"],
  completed: ["confirmed", "packed", "shipped", "delivered", "cancelled"],
  cancelled: ["confirmed", "pending", "packed", "shipped", "delivered", "completed"],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const db = getAdminDb();
    const { id } = await params;
    const body = await req.json();
    const nextStatus: string = body.status;
    const silent: boolean = Boolean(body.silent);

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

    const currentStatus = order?.status || "confirmed";

    if (
      !allowedTransitions[currentStatus] ||
      !allowedTransitions[currentStatus].includes(nextStatus)
    ) {
      return NextResponse.json(
        { error: `Invalid transition from ${currentStatus} to ${nextStatus}` },
        { status: 400 },
      );
    }

    // 📧 SEND STATUS EMAIL only if not silent and status is customer-facing
    const isStatusEmail =
      !silent &&
      (nextStatus === "packed" ||
        nextStatus === "shipped" ||
        nextStatus === "delivered");

    if (isStatusEmail && (!order.deliveryAddress || !order.deliveryAddress.email)) {
      return NextResponse.json(
        { error: "Order missing delivery address email for notification" },
        { status: 400 },
      );
    }

    await orderRef.update({
      status: nextStatus,
      updatedAt: new Date(),
    });

    if (currentStatus !== nextStatus && isStatusEmail && order.deliveryAddress?.email) {
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
    console.error("Update order error:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const db = getAdminDb();
    const { id } = await params;
    const orderRef = db.collection("orders").doc(id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await orderRef.delete();

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete order error:", err);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 },
    );
  }
}

