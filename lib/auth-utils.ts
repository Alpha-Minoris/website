import { headers } from 'next/headers'

export type EditContext = {
    sectionId?: string
    actionType?: 'create' | 'update' | 'delete' | 'publish'
    path?: string
}

/**
 * Basic check for authentication.
 * PERFORMANCE: In production (Vercel), returns false immediately without checking headers
 * This enables caching since we don't make the page dynamic
 * Only localhost has edit rights (development)
 */
export async function isAuthenticated() {
    // PERFORMANCE: Check environment first to avoid calling headers() in production
    // This makes the production page cacheable
    const isProduction = process.env.NODE_ENV === 'production' && !process.env.IS_LOCAL

    if (isProduction) {
        // Production: Always false, enables caching
        return false
    }

    // Development: Check headers for localhost
    const headersList = await headers()
    const host = headersList.get('host') || ''
    return host.includes('localhost') || host.includes('127.0.0.1')
}

/**
 * Center point for checking editing rights.
 * Abstracted to support granular, context-aware permissions in the future.
 */
export async function checkEditRights(context?: EditContext) {
    // For now, edit rights match authentication status (localhost only)
    const isAuth = await isAuthenticated()

    if (!isAuth) {
        console.warn(`[auth-utils] Unauthorized edit attempt. Context:`, context)
        return false
    }

    return true
}
