import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/explore",
  "/how-it-works",
  "/services/(.*)",
  "/providers/(.*)",
  "/api/webhook/stripe",
  "/api/webhook/clerk",
  "/api/public/(.*)",
  "/auth/sign-in(.*)",
  "/auth/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  const { userId } = await auth();
  if (!isPublicRoute(req) && !userId) {
    const signInUrl = new URL('/auth/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};