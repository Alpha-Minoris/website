'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
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

        // Invalidate cache even if no changes (to be safe)
        // revalidateTag in Next.js 16 requires options object as second param
        await revalidateTag('sections', {})
        await revalidateTag('versions', {})

        // Also invalidate the full route cache for /
        revalidatePath('/')

        console.log(`[Publish] Cache invalidated, published ${result.publishedCount} sections`)

        return {
            success: result.success,
            publishedCount: result.publishedCount
        }
    } catch (error: any) {
        console.error('[Publish] Error:', error)
        return { success: false, error: error.message }
    }
}
