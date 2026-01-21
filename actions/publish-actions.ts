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

        // Call production revalidation API
        // This ensures the PRODUCTION server invalidates its own cache
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        console.log('[Publish] Calling revalidation API at:', `${siteUrl}/api/revalidate`)

        try {
            const revalidateRes = await fetch(`${siteUrl}/api/revalidate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timestamp: Date.now() })
            })

            if (revalidateRes.ok) {
                const data = await revalidateRes.json()
                console.log('[Publish] ✅ Cache revalidated:', data)
            } else {
                console.error('[Publish] ⚠️ Revalidation API error:', await revalidateRes.text())
            }
        } catch (fetchError: any) {
            console.error('[Publish] ⚠️ Failed to call revalidation API:', fetchError.message)
            console.log('[Publish] This is normal on localhost - production will revalidate on deployment')
        }

        console.log(`[Publish] ✅ SUCCESS! Published ${result.publishedCount} sections`)
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
