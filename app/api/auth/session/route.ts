import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json(
      { error: "Missing ID token" },
      { status: 400 }
    );
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  const sessionCookie = await admin
    .auth()
    .createSessionCookie(idToken, { expiresIn });

  const response = NextResponse.json({ success: true });

  response.cookies.set("__session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });

  return response;
}
