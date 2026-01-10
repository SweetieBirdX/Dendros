import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes: /[id]/admin
    if (pathname.match(/^\/(.+)\/admin/)) {
        // Extract dendrosId from the path
        const dendrosId = pathname.split('/')[1];

        // Get the session token from cookies
        const sessionToken = request.cookies.get('__session')?.value;

        if (!sessionToken) {
            // No authentication token found, redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            // In a production environment, you would:
            // 1. Verify the Firebase ID token server-side using Firebase Admin SDK
            // 2. Extract the user's UID from the verified token
            // 3. Query Firestore to check if user's UID matches the document's ownerId

            // For now, we'll add a header to indicate this needs server-side verification
            // This will be fully implemented when we add Firebase Admin SDK
            const response = NextResponse.next();
            response.headers.set('x-dendros-id', dendrosId);
            response.headers.set('x-requires-auth', 'true');

            return response;
        } catch (error) {
            console.error('Middleware authentication error:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
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
};
