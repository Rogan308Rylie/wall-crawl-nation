import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only match admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // TEMP: allow access, auth handled in page/API
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
