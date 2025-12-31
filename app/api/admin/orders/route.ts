import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // admin-only logic here
}
