// lib/adminAuth.ts
// Shared admin authentication helper - used by all /api/admin/* routes.
// Verifies the __session cookie and checks role === "admin" in Firestore.
// Returns the decoded token on success, or throws with a NextResponse on failure.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export type AdminAuthResult =
  | { ok: true; uid: string }
  | { ok: false; response: NextResponse };

export async function requireAdmin(req?: Request): Promise<AdminAuthResult> {
  let uid: string | null = null;

  // 1. Try Bearer token from request headers if provided
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split("Bearer ")[1];
        const decoded = await getAdminAuth().verifyIdToken(token);
        uid = decoded.uid;
      } catch (err) {
        // Fall back to session cookie
      }
    }
  }

  // 2. Try session cookie
  if (!uid) {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("__session")?.value;
      if (sessionCookie) {
        const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
        uid = decoded.uid;
      }
    } catch (err) {
      // Cookie verification failed
    }
  }

  if (!uid) {
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
