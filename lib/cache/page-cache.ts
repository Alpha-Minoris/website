/**
 * Cache utility for website sections
 * 
 * NOTE: We rely on page-level revalidation (revalidate = 3600 in app/page.tsx)
 * instead of function-level caching because Supabase client uses cookies()
 * which cannot be used inside unstable_cache()
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Get sections from database
 * Cached at page level via revalidate setting
 */
export async function getSections(canEdit: boolean) {
    console.log('[Cache] Fetching sections from database...')

    const supabase = canEdit ? await createAdminClient() : await createClient()

    const { data: sections, error } = await supabase
        .from('website_sections')
        .select('*')
        .order('sort_order', { ascending: true })

    if (error) throw error

    console.log(`[Cache] Fetched ${sections?.length || 0} sections`)
    return sections
}

/**
 * Get section versions from database
 * Cached at page level via revalidate setting
 */
export async function getVersions(sectionIds: string[], canEdit: boolean) {
    console.log('[Cache] Fetching versions from database...')

    const supabase = canEdit ? await createAdminClient() : await createClient()

    const { data: versions } = await supabase
        .from('website_section_versions')
        .select('section_id, layout_json')
        .eq('status', 'published')
        .in('section_id', sectionIds)

    console.log(`[Cache] Fetched ${versions?.length || 0} versions`)
    return versions
}
