import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

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

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: 1000 * 60 * 60 * 24 * 5, // 5 days
    });

    (await cookies()).set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
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
 * 👤 READ SESSION (used to check current user)
 */
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    return NextResponse.json({ user: decoded });
  } catch {
    return NextResponse.json({ user: null });
  }
}
