/**
 * Cache utility for website sections
 * 
 * PUBLIC PAGE CACHE - No cookies, enables static generation
 * For edit mode cache with cookies, see edit-cache.ts
 */

import { unstable_cache } from 'next/cache'
import { createCacheCompatibleClient } from '@/lib/supabase/server'

/**
 * Get sections from database (PUBLIC - no auth)
 * Used by production public page (/view)
 * Cached via unstable_cache with 1-hour revalidation
 */
export const getSections = unstable_cache(
    async () => {
        console.log('[Cache] Fetching sections from database...')

        const supabase = createCacheCompatibleClient()

        const { data: sections, error } = await supabase
            .from('website_sections')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) throw error

        console.log(`[Cache] Fetched ${sections?.length || 0} sections`)
        return sections
    },
    ['public-sections'], // Cache key
    {
        revalidate: 60, // 1 minute
        tags: ['sections'] // Tag for on-demand revalidation
    }
)

/**
 * Get PUBLISHED section versions from database (PUBLIC - no auth)
 * Used by production public page (/view)
 * Cached via unstable_cache with 1-hour revalidation
 */
export const getVersions = unstable_cache(
    async (sectionIds: string[]) => {
        console.log('[Cache] Fetching versions from database...')

        const supabase = createCacheCompatibleClient()

        const { data: versions } = await supabase
            .from('website_section_versions')
            .select('section_id, layout_json')
            .eq('status', 'published')
            .in('section_id', sectionIds)

        console.log(`[Cache] Fetched ${versions?.length || 0} versions`)
        return versions
    },
    ['public-versions'], // Cache key
    {
        revalidate: 60, // 1 minute
        tags: ['versions'] // Tag for on-demand revalidation
    }
)
