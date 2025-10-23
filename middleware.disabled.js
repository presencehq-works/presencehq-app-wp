// middleware.js
import { NextResponse } from "next/server";

// Helper to decode a base64url JSON Web Token payload safely
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  if (path.startsWith("/admin")) {
    const token = req.cookies.get("__session")?.value;

    // No token → redirect to login
    if (!token) {
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "admin") {
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // ✅ Token & role OK
    return NextResponse.next();
  }

  // Public routes
  return NextResponse.next();
}

// Apply only to /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
