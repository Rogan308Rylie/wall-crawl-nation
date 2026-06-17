// lib/adminAuth.ts
// Shared admin authentication helper — used by all /api/admin/* routes.
// Verifies the __session cookie and checks role === "admin" in Firestore.
// Returns the decoded token on success, or throws with a NextResponse on failure.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export type AdminAuthResult =
  | { ok: true; uid: string }
  | { ok: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    uid = decoded.uid;
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const userSnap = await getAdminDb().collection("users").doc(uid).get();
  if (!userSnap.exists || userSnap.data()?.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, uid };
}
