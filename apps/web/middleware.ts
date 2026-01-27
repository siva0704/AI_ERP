import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simplified Role Mapping for Middleware (Edge Runtime)
const ROLE_PERMISSIONS: Record<string, string[]> = {
    'GROUP_ADMIN': ['/dashboard', '/admissions', '/fees', '/attendance', '/timetable', '/exams', '/library', '/transport', '/settings'],
    'BRANCH_ADMIN': ['/dashboard', '/admissions', '/fees', '/attendance', '/timetable', '/exams', '/library', '/transport', '/settings'],
    'STAFF': ['/dashboard', '/attendance', '/timetable', '/exams', '/library', '/transport'],
    'STUDENT': ['/dashboard', '/fees', '/timetable', '/exams', '/library'], // Transport removed
};

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths
    const isPublicPath = path === '/' || path === '/login' || path.startsWith('/api') || path.startsWith('/_next') || path.includes('.');

    // Check for demo token
    const token = request.cookies.get('demo-token')?.value;
    const role = request.cookies.get('user-role')?.value || 'GUEST';

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

    // RBAC: Check if role has access to the path
    const allowedPaths = ROLE_PERMISSIONS[role] || [];

    // Check if the current path starts with any of the allowed paths
    // We strictly check the root of the module (e.g., /fees requires access to /fees/*)
    const isAllowed = allowedPaths.some(allowed => path === allowed || path.startsWith(`${allowed}/`));

    // Special case: /dashboard is allowed for everyone who is logged in (handled by ROLE_PERMISSIONS, but fallback safety)
    if (path === '/dashboard') {
        return NextResponse.next();
    }

    if (!isAllowed) {
        // Redirect to dashboard with access denied param? Or just dashboard main
        // For now, redirect to dashboard which is safe for everyone
        return NextResponse.redirect(new URL('/dashboard?error=access_denied', request.url));
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
