'use server'

import { revalidatePath } from 'next/cache'
import { publishAllChanges, getUnpublishedCount } from '@/lib/staging/staging-utils'

/**
 * Get count of unpublished sections
 * Server action wrapper for client component use
 */
export async function getUnpublishedCountAction(): Promise<number> {
    return await getUnpublishedCount()
}

/**
 * Publish all sections with unpublished changes
 * This is the ONLY place cache invalidation happens (no more spam!)
 */
export async function publishChangesAction() {
    try {
        const result = await publishAllChanges()

        // Invalidate cache ONCE after publishing
        revalidatePath('/')

        console.log(`[publishChangesAction] Published ${result.publishedCount} sections, cache invalidated`)

        return {
            success: true,
            publishedCount: result.publishedCount,
            message: `Successfully published ${result.publishedCount} section(s)`
        }
    } catch (error) {
        console.error('[publishChangesAction] Error publishing:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}
