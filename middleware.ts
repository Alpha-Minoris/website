import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * ========================================================================
 * MIDDLEWARE - AUTHENTICATION & CACHING STRATEGY
 * ========================================================================
 * 
 * CURRENT STATE (Phase 1):
 * - Edit mode: localhost only (via headers)
 * - Production: No edit mode → fully cached
 * - Auth: None (localhost check only)
 * 
 * FUTURE STATE (Phase 2 - For AI Agent implementing authentication):
 * - Edit mode: Session-based authentication (*.alpha-minoris.ai)
 * - Production: Authenticated users get edit mode
 * - Caching: Two-tier system (public cached, authenticated dynamic)
 * 
 * ========================================================================
 * TODO FOR AUTHENTICATION IMPLEMENTATION:
 * ========================================================================
 * 
 * 1. INSTALL DEPENDENCIES:
 *    npm install @supabase/ssr
 * 
 * 2. UNCOMMENT SESSION CHECK BELOW (marked with "// AUTH:")
 * 
 * 3. UPDATE auth-utils.ts:
 *    - Replace localhost check with session check
 *    - Use Supabase auth.getUser() to verify session
 * 
 * 4. CACHE BYPASS STRATEGY:
 *    When user is authenticated:
 *    - Set header: x-middleware-cache: no-cache
 *    - This bypasses Vercel edge cache for that request
 *    - Public users still get cached pages
 * 
 * 5. OPTIONAL - TWO-ROUTE STRATEGY:
 *    If cache bypass doesn't work well:
 *    - Create /admin-view route with dynamic rendering
 *    - Rewrite authenticated requests to /admin-view
 *    - Keep public route static and cached
 * 
 * ========================================================================
 */

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Localhost auto-redirect to editing mode
    const host = request.headers.get('host') || ''
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')

    if (isLocalhost && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/edit', request.url))
    }

    return response
}

/**
 * ========================================================================
 * MATCHER CONFIGURATION
 * ========================================================================
 * Apply middleware to all routes except static files and API routes
 */
export const config = {
    matcher: '/',
}
