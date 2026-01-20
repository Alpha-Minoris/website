/**
 * Cache utility for website sections
 * 
 * PUBLIC PAGE CACHE - No cookies, enables static generation
 * For edit mode cache with cookies, see edit-cache.ts
 */

import { createCacheCompatibleClient } from '@/lib/supabase/server'

/**
 * Get sections from database (PUBLIC - no auth)
 * Used by production public page (/)
 * Cached at page level via revalidate setting
 */
export async function getSections() {
    console.log('[Cache] Fetching sections from database...')

    // Always use cache-compatible client (no cookies!)
    const supabase = createCacheCompatibleClient()

    const { data: sections, error } = await supabase
        .from('website_sections')
        .select('*')
        .order('sort_order', { ascending: true })

    if (error) throw error

    console.log(`[Cache] Fetched ${sections?.length || 0} sections`)
    return sections
}

/**
 * Get PUBLISHED section versions from database (PUBLIC - no auth)
 * Used by production public page (/)
 * Cached at page level via revalidate setting
 */
export async function getVersions(sectionIds: string[]) {
    console.log('[Cache] Fetching versions from database...')

    // Always use cache-compatible client (no cookies!)
    const supabase = createCacheCompatibleClient()

    const { data: versions } = await supabase
        .from('website_section_versions')
        .select('section_id, layout_json')
        .eq('status', 'published')
        .in('section_id', sectionIds)

    console.log(`[Cache] Fetched ${versions?.length || 0} versions`)
    return versions
}
