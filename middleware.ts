/**
 * Route protection middleware — Next.js Edge Runtime
 *
 * AUTH-07: Role-based route protection (CUSTOMER/VENDOR/ADMIN/SUPER_ADMIN)
 *
 * Architecture note:
 * The JWT access token lives in Zustand (JS memory) and is NOT accessible from
 * the Edge runtime. Instead, this middleware uses two cookies:
 *
 *   1. `refresh_token`  — httpOnly, set by the backend on login.
 *      Presence indicates the user has an active session.
 *
 *   2. `session_role`   — non-httpOnly, set by the frontend login handler
 *      after a successful login (contains only the user's role string, e.g.
 *      "CUSTOMER"). Used for lightweight role-based routing.
 *      The actual access token is never stored here.
 */

import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Route configuration
// ---------------------------------------------------------------------------

const PUBLIC_PREFIXES = [
  '/login',
  '/register',
  '/verify',
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
] as const;

const ROLE_ROUTES: Record<string, string[]> = {
  CUSTOMER: ['/customer'],
  VENDOR: ['/vendor'],
  ADMIN: ['/admin'],
  SUPER_ADMIN: ['/admin', '/super-admin'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAllowedForRole(pathname: string, role: string): boolean {
  const allowed = ROLE_ROUTES[role] ?? [];
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // 1. Always allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Check for an active session via the httpOnly refresh_token cookie
  const hasSession = Boolean(request.cookies.get('refresh_token')?.value);

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-based routing — only enforced when session_role cookie is present
  const sessionRole = request.cookies.get('session_role')?.value;

  if (sessionRole) {
    const role = sessionRole.toUpperCase();

    if (!isAllowedForRole(pathname, role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher — exclude Next.js internals, static assets, and API routes
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
