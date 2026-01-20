import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * ========================================================================
 * PROXY - AUTHENTICATION & ROUTING
 * ========================================================================
 * 
 * ARCHITECTURE:
 * - /           → This proxy runs, handles auth redirects (can be dynamic)
 * - /view       → NO proxy, fully static with ISR caching
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

    // LOCALHOST: Auto-redirect root to /edit
    if (isLocalhost && pathname === '/') {
        return NextResponse.redirect(new URL('/edit', request.url))
    }

    // PRODUCTION /edit: Future auth check goes here
    // For now, allow access (will block when auth is implemented)
    if (pathname.startsWith('/edit')) {
        // TODO: Check authentication
        // const session = await getSession(request)
        // if (!session) {
        //   return NextResponse.redirect(new URL('/view', request.url))
        // }
    }

    return NextResponse.next()
}

/**
 * Apply proxy to / and /edit routes ONLY
 * /view is intentionally excluded to enable ISR caching
 */
export const config = {
    matcher: ['/', '/edit/:path*'],
}
