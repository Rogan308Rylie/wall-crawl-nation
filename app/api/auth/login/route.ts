import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing ID token" },
        { status: 400 }
      );
    }

    const expiresIn = 1000 * 60 * 60 * 24 * 5; // 5 days

    const sessionCookie = await getAdminAuth().createSessionCookie(
      idToken,
      { expiresIn }
    );

    (await cookies()).set("__session", sessionCookie, {
      httpOnly: true,
      secure: false, // ✅ REQUIRED FOR localhost
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
