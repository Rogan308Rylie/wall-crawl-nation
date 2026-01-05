export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

// ⚠️ TEMPORARY — DELETE AFTER USE
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email query param required" },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const user = await auth.getUserByEmail(email);

    await auth.setCustomUserClaims(user.uid, { admin: true });

    return NextResponse.json({
      success: true,
      message: `Admin claim set for ${email}`,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
