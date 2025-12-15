import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if accessing admin routes
  const isAdminRoute = pathname.includes("/admin");

  if (isAdminRoute) {
    // Get session token from cookie (better-auth default cookie name)
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      // Redirect to login
      const locale = pathname.split("/")[1];
      const validLocale = ["en", "uk"].includes(locale) ? locale : "en";
      const loginUrl = new URL(`/${validLocale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Note: Full role check happens in layout/page components
    // Middleware only ensures session exists for performance
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
