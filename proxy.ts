import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes: /[id]/admin
    if (pathname.match(/^\/(.+)\/admin/)) {
        // Extract dendrosId from the path
        const dendrosId = pathname.split('/')[1];

        // TODO: Implement server-side auth with Firebase Admin SDK
        // For now, we rely on client-side auth in the page component
        // This is acceptable for development but should be enhanced for production

        const response = NextResponse.next();
        response.headers.set('x-dendros-id', dendrosId);

        return response;
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
