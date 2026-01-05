export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

// Allowed transitions (keep your business rules)
const allowedTransitions: Record<string, string[]> = {
  confirmed: ["packed"],
  packed: ["shipped"],
  shipped: ["delivered"],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 16
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

    const currentStatus = orderSnap.data()?.status;

    if (
      !allowedTransitions[currentStatus] ||
      !allowedTransitions[currentStatus].includes(nextStatus)
    ) {
      return NextResponse.json(
        { error: `Invalid transition from ${currentStatus} to ${nextStatus}` },
        { status: 400 }
      );
    }

    await orderRef.update({
      status: nextStatus,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
