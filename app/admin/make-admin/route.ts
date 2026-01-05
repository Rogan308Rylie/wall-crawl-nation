import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

// ⚠️ TEMPORARY ENDPOINT — DELETE AFTER USE
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
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
