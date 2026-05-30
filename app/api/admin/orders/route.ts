import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    // 1️⃣ Check session cookie exists
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify session + check admin role in Firestore
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    const userSnap = await getAdminDb()
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Fetch orders (only reached if admin)
    const snapshot = await getAdminDb()
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
