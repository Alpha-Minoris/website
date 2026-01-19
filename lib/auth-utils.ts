import { headers } from 'next/headers'

export type EditContext = {
    sectionId?: string
    actionType?: 'create' | 'update' | 'delete' | 'publish'
    path?: string
}

/**
 * Basic check for authentication.
 * Currently defaults to true ONLY on localhost.
 */
export async function isAuthenticated() {
    const headersList = await headers()
    const host = headersList.get('host') || ''

    // In production, this would check Supabase auth session
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
