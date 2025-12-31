import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req: Request) {
  const allowed = await isAdmin(req);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await adminDb
    .collection("orders")
    .orderBy("paidAt", "desc")
    .get();

  const orders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(orders);
}

export async function PATCH(req: Request) {
  const allowed = await isAdmin(req);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, status } = await req.json();

  if (!orderId || !status) {
    return NextResponse.json(
      { error: "Missing orderId or status" },
      { status: 400 }
    );
  }

  await adminDb.collection("orders").doc(orderId).update({
    status,
    updatedAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
