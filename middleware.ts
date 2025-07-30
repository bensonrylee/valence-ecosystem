import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/explore",
    "/how-it-works",
    "/services/(.*)",
    "/providers/(.*)",
    "/api/webhook/stripe",
    "/api/webhook/clerk",
    "/api/public/(.*)",
  ],
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};