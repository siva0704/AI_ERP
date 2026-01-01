import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths
    const isPublicPath = path === '/' || path === '/login' || path.startsWith('/api') || path.startsWith('/_next') || path.includes('.');

    // Check for demo token
    const token = request.cookies.get('demo-token')?.value;

    // Redirect logic
    if (isPublicPath) {
        // If user is logged in and visits login page, redirect to dashboard
        if (path === '/login' && token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // If no token and trying to access protected route, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
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
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
