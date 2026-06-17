export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();

    if (typeof body.price !== "number" || body.price <= 0 || !Number.isFinite(body.price)) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    await getAdminDb()
      .collection("posters")
      .doc(id)
      .update({
        title: body.title,
        price: body.price,
        updatedAt: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH POSTER ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
