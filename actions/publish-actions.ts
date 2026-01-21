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
    console.log('='.repeat(80))
    console.log('[Publish] Publishing changes...')
    try {
        const result = await publishAllChanges()
        console.log(`[Publish] publishAllChanges result:`, result)

        // Invalidate cache even if no changes (to be safe)
        // revalidateTag in Next.js 16 requires options object as second param
        console.log('[Publish] Invalidating cache tags...')
        await revalidateTag('sections', {})
        await revalidateTag('versions', {})

        // Also invalidate the full route cache for /
        console.log('[Publish] Revalidating path /')
        revalidatePath('/')

        console.log(`[Publish] ✅ SUCCESS! Published ${result.publishedCount} sections, cache invalidated`)
        console.log('='.repeat(80))

        return {
            success: result.success,
            publishedCount: result.publishedCount
        }
    } catch (error: any) {
        console.error('='.repeat(80))
        console.error('[Publish] ❌ ERROR!')
        console.error('[Publish] Error:', error)
        console.error('='.repeat(80))
        return { success: false, error: error.message }
    }
}
