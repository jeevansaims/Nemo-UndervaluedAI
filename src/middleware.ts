import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isPublicPage = 
    req.nextUrl.pathname === "/" || 
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/static") ||
    req.nextUrl.pathname.startsWith("/funds") || // Public funds list
    req.nextUrl.pathname.startsWith("/analysis"); // Public analysis

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return null;
  }

  // Allow public pages, but for now we won't force login globally to allow "Public Mode" browsing.
  // We only enforce it if they try to access strictly private areas.
  // Actually, per requirements: "If not logged in -> public mode forced".
  // So we don't redirect to login unless they hit a specific protected route.
  
  // For now, let's keep it open and handle "Private Mode" via UI state.
  return null;
});

// Optionally invoke on specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
