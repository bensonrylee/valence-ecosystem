import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/messages(.*)',
  '/bookings(.*)',
  '/profile(.*)',
  '/become-provider',
]);

// Define public API routes that don't need auth
const isPublicApiRoute = createRouteMatcher([
  '/api/webhook(.*)',
  '/api/stripe/create-payment-intent',
]);

export default clerkMiddleware((auth, req) => {
  // Allow public API routes
  if (isPublicApiRoute(req)) {
    return;
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};