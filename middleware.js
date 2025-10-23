// middleware.js
import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const path = url.pathname;
  const token = req.cookies.get("__session")?.value;

  // ✅ Redirect signed-in users from root to /client-sizing
  if (path === "/" && token) {
    url.pathname = "/client-sizing";
    return NextResponse.redirect(url);
  }

  // ✅ Handle Firebase password reset links at root level
  if (
    path === "/" &&
    url.searchParams.get("mode") === "resetPassword" &&
    url.searchParams.get("oobCode")
  ) {
    url.pathname = "/admin/reset";
    return NextResponse.redirect(url);
  }

  // ✅ Protect admin routes
  if (path.startsWith("/admin")) {
    // Always allow login and reset pages
    if (path.startsWith("/admin/login") || path.startsWith("/admin/reset")) {
      return NextResponse.next();
    }

    // Redirect to login if no valid session cookie
    if (!token) {
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // ✅ Allow everything else
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"], // include root for redirect logic
};
