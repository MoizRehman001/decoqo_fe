/**
 * Route protection middleware — Next.js Edge Runtime
 *
 * Simplified for mock/dev mode:
 * - Public routes are always allowed
 * - Protected routes require a `refresh_token` cookie (set on login)
 * - Role enforcement is handled client-side in each portal layout
 */

import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Public routes — always accessible without auth
// ---------------------------------------------------------------------------

const PUBLIC_PREFIXES = [
  '/',
  '/login',
  '/register',
  '/verify',
  '/admin-login',
  '/explore',
  '/vendors',
  '/how-it-works',
  '/pricing',
  '/cities',
  '/spaces',
  '/legal',
  '/about',
  '/contact',
  '/blog',
  '/unauthorized',
  '/forgot-password',
] as const;

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((prefix) => prefix !== '/' && pathname.startsWith(prefix));
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie — set by login form
  const hasSession =
    Boolean(request.cookies.get('refresh_token')?.value) ||
    Boolean(request.cookies.get('session_role')?.value);

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Session exists — allow through. Role enforcement is client-side.
  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
