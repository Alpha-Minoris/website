import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * ========================================================================
 * PROXY - AUTHENTICATION & ROUTING
 * ========================================================================
 * 
 * ARCHITECTURE:
 * - /           → Public page, NO proxy (enables caching)
 * - /edit       → Protected by this proxy, auth required
 * 
 * LOCALHOST: Redirect / → /edit
 * PRODUCTION: Protect /edit (future: require auth)
 * ========================================================================
 */

export default function proxy(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
    const pathname = request.nextUrl.pathname

    // LOCALHOST: Auto-redirect root to /edit (but NOT /view - that's for preview)
    if (isLocalhost && pathname === '/') {
        return NextResponse.redirect(new URL('/edit', request.url))
    }

    // PRODUCTION /edit: Future auth check goes here
    // For now, allow access (will block when auth is implemented)
    if (pathname.startsWith('/edit')) {
        // TODO: Check authentication
        // const session = await getSession(request)
        // if (!session) {
        //   return NextResponse.redirect(new URL('/', request.url))
        // }
    }

    return NextResponse.next()
}

/**
 * Apply proxy to / (localhost redirect only) and /edit routes
 */
export const config = {
    matcher: ['/', '/edit/:path*'],
}
