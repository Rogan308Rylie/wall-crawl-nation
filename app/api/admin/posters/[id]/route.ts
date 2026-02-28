export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("PATCH route hit");

    const { id } = await params;

    // 🔐 Verify session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );

    const userSnap = await getAdminDb()
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

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
