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

    // ========================================================================
    // CURRENT IMPLEMENTATION (localhost only, no real auth)
    // ========================================================================
    // This section will be replaced by session-based auth below

    // For now, rely on auth-utils.ts to check localhost
    // No middleware action needed - all handled in page.tsx

    // ========================================================================
    // FUTURE IMPLEMENTATION (session-based auth)
    // ========================================================================
    // Uncomment when implementing authentication:

    /*
    // AUTH: Check for authentication session
    const authSession = request.cookies.get('sb-auth-token')
    
    // If user is authenticated (has valid session):
    if (authSession) {
        // AUTH: Verify session with Supabase
        // const supabase = createMiddlewareClient({ req: request, res: response })
        // const { data: { session } } = await supabase.auth.getSession()
        
        // if (session) {
        //     // User is authenticated - bypass cache for personalized experience
        //     response.headers.set('x-middleware-cache', 'no-cache')
        //     response.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate')
        //     
        //     // OPTIONAL: Rewrite to admin-specific route for better separation
        //     // return NextResponse.rewrite(new URL('/admin-view', request.url))
        // }
    }
    */

    // For public users (no session), allow normal caching
    return response
}

/**
 * ========================================================================
 * MATCHER CONFIGURATION
 * ========================================================================
 * Apply middleware to all routes except static files and API routes
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes)
         */
        '/((?!_next/static|_next/image|favicon.ico|api).*)',
    ],
}
