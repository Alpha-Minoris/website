/**
 * Cache utility for EDIT MODE
 * 
 * Uses createAdminClient with cookies for authenticated editing
 */

import { createAdminClient } from '@/lib/supabase/server'

/**
 * Get sections from database (EDIT MODE - with auth)
 * Used by /edit route
 */
export async function getSections() {
    console.log('[Edit Cache] Fetching sections from database...')

    const supabase = await createAdminClient()

    const { data: sections, error } = await supabase
        .from('website_sections')
        .select('*')
        .order('sort_order', { ascending: true })

    if (error) throw error

    console.log(`[Edit Cache] Fetched ${sections?.length || 0} sections`)
    return sections
}

/**
 * Get DRAFT versions for editor (loads draft_version_id)
 * Editor always sees draft if it exists, otherwise published
 */
export async function getDraftVersions(sectionIds: string[]) {
    console.log('='.repeat(80))
    console.log('[Edit Cache] Fetching draft versions for editor...')
    console.log('[Edit Cache] Section IDs requested:', sectionIds)

    const supabase = await createAdminClient()

    // Get sections with both draft and published version IDs
    const { data: sections } = await supabase
        .from('website_sections')
        .select('id, slug, draft_version_id, published_version_id')
        .in('id', sectionIds)

    if (!sections) {
        console.log('[Edit Cache] No sections found!')
        return []
    }

    console.log('[Edit Cache] Sections with version IDs:')
    sections.forEach(s => {
        const selectedVersion = s.draft_version_id || s.published_version_id
        const usingDraft = !!s.draft_version_id
        console.log(`  - ${s.slug}: using ${usingDraft ? 'DRAFT' : 'PUBLISHED'} version ${selectedVersion}`)
        console.log(`      (draft=${s.draft_version_id || 'NONE'}, published=${s.published_version_id})`)
    })

    // For each section, get draft OR published version
    const versionIds = sections.map(s => s.draft_version_id || s.published_version_id).filter(Boolean)

    console.log('[Edit Cache] Will fetch these version IDs:', versionIds)

    const { data: versions } = await supabase
        .from('website_section_versions')
        .select('id, section_id, layout_json, status')
        .in('id', versionIds)

    console.log(`[Edit Cache] Fetched ${versions?.length || 0} versions:`)
    versions?.forEach(v => {
        console.log(`  - Version ${v.id}: section=${v.section_id}, status=${v.status}, hasLayout=${!!v.layout_json}`)
    })
    console.log('='.repeat(80))

    return versions
}
