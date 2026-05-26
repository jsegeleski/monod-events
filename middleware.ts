import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isAdmin = path.startsWith("/admin");
  const isCheckIn = path.startsWith("/check-in");

  const adminAuthed = request.cookies.get("admin_auth")?.value === "true";
  const checkInAuthed = request.cookies.get("checkin_auth")?.value === "true";

  if (isAdmin && !adminAuthed && path !== "/admin-login") {
    return NextResponse.redirect(
  new URL(`/admin-login?next=${encodeURIComponent(path)}`, request.url)
);
  }

  if (isCheckIn && !checkInAuthed && path !== "/checkin-login") {
    return NextResponse.redirect(
  new URL(`/checkin-login?next=${encodeURIComponent(path)}`, request.url)
);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/check-in/:path*"],
};