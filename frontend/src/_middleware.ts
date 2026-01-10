import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Note: Use cookies for server-side checks
  const { pathname } = request.nextUrl;

  // If trying to access dashboard without a token, redirect to login
  if (!token && (pathname.startsWith('/student') || pathname.startsWith('/lecturer'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/lecturer/:path*'],
};