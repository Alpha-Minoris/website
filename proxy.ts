import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * ========================================================================
 * PROXY - AUTHENTICATION & ROUTING
 * ========================================================================
 * 
 * CURRENT STATE:
 * - Localhost: Auto-redirect to /edit
 * - Production: Public users stay on /
 * 
 * FUTURE: Session-based authentication
 * ========================================================================
 */

export default function proxy(request: NextRequest) {
    // Localhost auto-redirect to editing mode
    const host = request.headers.get('host') || ''
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')

    if (isLocalhost && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/edit', request.url))
    }

    return NextResponse.next()
}

/**
 * Apply proxy to root and edit routes
 */
export const config = {
    matcher: ['/', '/edit/:path*'],
}
