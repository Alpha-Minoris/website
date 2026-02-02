import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * ========================================================================
 * MIDDLEWARE - AUTHENTICATION & ROUTING
 * ========================================================================
 * 
 * ARCHITECTURE:
 * - /              → Public page, NO auth (enables caching)
 * - /view          → Public page, NO auth (preview with published versions)
 * - /use-cases     → PUBLIC PAGE, NO auth (whitelisted - use case explorer)
 * - /edit          → Protected by this middleware, auth required
 * 
 * PUBLIC ROUTES (whitelisted - no authentication required):
 * - /
 * - /view
 * - /use-cases
 * - /api/*
 * - /_next/*
 * - /favicon.ico
 * - /icon.png
 * - /apple-icon.png
 * 
 * LOCALHOST: Redirect / → /edit (for development convenience)
 * PRODUCTION: Protect /edit (future: require auth)
 * ========================================================================
 */

// Public routes that bypass authentication
const PUBLIC_ROUTES = [
  '/',
  '/view',
  '/use-cases',  // NEW: Use Cases page - publicly accessible
]

// Check if a pathname matches any public route
function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true
  }
  
  // Public prefixes
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/view/')) {
    return true
  }
  
  // Static files
  if (pathname === '/favicon.ico' ||
      pathname === '/icon.png' ||
      pathname === '/apple-icon.png' ||
      pathname.startsWith('/assets/')) {
    return true
  }
  
  return false
}

export default function middleware(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
    const pathname = request.nextUrl.pathname

    // PUBLIC ROUTES: Skip all authentication checks
    // These routes are publicly accessible without any auth
    if (isPublicRoute(pathname)) {
        // LOCALHOST: Still redirect / to /edit for dev convenience
        if (isLocalhost && pathname === '/') {
            return NextResponse.redirect(new URL('/edit', request.url))
        }
        
        // Otherwise, allow access to public routes
        return NextResponse.next()
    }

    // PROTECTED ROUTES: /edit and sub-routes
    if (pathname.startsWith('/edit')) {
        // LOCALHOST: Allow access (development mode)
        if (isLocalhost) {
            return NextResponse.next()
        }
        
        // PRODUCTION: Future auth check goes here
        // TODO: Check authentication
        // const session = await getSession(request)
        // if (!session) {
        //   return NextResponse.redirect(new URL('/', request.url))
        // }
    }

    return NextResponse.next()
}

/**
 * Matcher configuration for Next.js Middleware
 * 
 * This specifies which routes the middleware will run on.
 * Using a matcher allows Next.js to optimize performance by only
 * running middleware on specified routes.
 * 
 * Current matcher includes:
 * - / (root)
 * - /edit/* (all edit routes)
 * - /view/* (all view routes)
 * - /use-cases (new use cases page)
 */
export default middleware

export const config = {
    matcher: [
        '/',
        '/edit/:path*',
        '/view/:path*',
        '/use-cases',
        '/use-cases/:path*'
    ],
}
