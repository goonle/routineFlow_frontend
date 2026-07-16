import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("access_token") || request.cookies.has("refresh_token");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// The (app) route group is filesystem-only and never appears in the URL,
// so the matcher must list real URL segments.
export const config = {
  matcher: ["/dashboard/:path*", "/goals/:path*", "/calendar/:path*", "/notifications/:path*"],
};
