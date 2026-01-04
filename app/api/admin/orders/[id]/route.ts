import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

const VALID_TRANSITIONS: Record<string, string[]> = {
  confirmed: ["packed"],
  packed: ["shipped"],
  shipped: ["delivered"],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1️⃣ Read cookies (SYNC in App Router)
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify admin session
    const decoded = await getAdminAuth().verifySessionCookie(session, true);

    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Parse payload
    const { status: nextStatus } = await req.json();

    if (!nextStatus) {
      return NextResponse.json(
        { error: "Missing status" },
        { status: 400 }
      );
    }

    // 4️⃣ Fetch order
    const db = getAdminDb();
    const { id } = await params;
    const orderRef = db.collection("orders").doc(id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderSnap.data();
    const currentStatus = order?.status;

    // 5️⃣ Validate transition
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(nextStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} → ${nextStatus}`,
        },
        { status: 400 }
      );
    }

    // 6️⃣ Update Firestore
    await orderRef.update({
      status: nextStatus,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin order status update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
