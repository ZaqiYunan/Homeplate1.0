
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/', '/ingredients']; // Add any other routes that need protection
const AUTH_ROUTES = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentUserCookie = request.cookies.get('firebaseAuthToken'); // Example, adjust if you set a specific cookie on login

  // If trying to access a protected route without a session, redirect to login
  if (PROTECTED_ROUTES.includes(pathname) && !currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If trying to access an auth route with a session, redirect to home
  if (AUTH_ROUTES.includes(pathname) && currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     * - manifest.json (PWA manifest)
     * - robots.txt (SEO)
     * - sitemap.xml (SEO)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};
