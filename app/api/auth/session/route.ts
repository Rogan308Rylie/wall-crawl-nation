import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

/**
 * 🔐 CREATE SESSION (called after Firebase client login)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const expiresIn = 1000 * 60 * 60 * 24 * 5; // 5 days

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    (await cookies()).set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🚨 Session creation error:", err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}

/**
 * 👤 READ SESSION (used to check current user and detect expired cookies)
 */
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    return NextResponse.json({ user: null, expired: true });
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    return NextResponse.json({ user: decoded, expired: false });
  } catch (err) {
    console.warn("Session cookie invalid or expired, clearing cookie:", err);
    // Explicitly clear the expired cookie
    (await cookies()).set("__session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return NextResponse.json({ user: null, expired: true });
  }
}

/**
 * 🚪 LOGOUT (delete session cookie from server)
 */
export async function DELETE() {
  try {
    (await cookies()).set("__session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
