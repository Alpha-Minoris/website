/**
 * Staging/Publish Utility Functions
 * 
 * Manages draft versions and publishing workflow
 */

import { createAdminClient } from '@/lib/supabase/server'

/**
 * Get or create a draft version for a section
 * If draft already exists, returns it
 * If not, creates a new draft from published version
 */
export async function getOrCreateDraftVersion(sectionId: string) {
    const supabase = await createAdminClient()

    // 1. Get section with both published and draft version IDs
    const { data: section, error: sectionError } = await supabase
        .from('website_sections')
        .select('id, slug, published_version_id, draft_version_id')
        .eq('id', sectionId)
        .single()

    if (sectionError) {
        console.error('[getOrCreateDraftVersion] Error fetching section:', sectionError)
        throw sectionError
    }

    // 2. If draft already exists, return it
    if (section.draft_version_id) {
        const { data: draftVersion, error: draftError } = await supabase
            .from('website_section_versions')
            .select('*')
            .eq('id', section.draft_version_id)
            .single()

        if (!draftError && draftVersion) {
            console.log(`[getOrCreateDraftVersion] Using existing draft ${section.draft_version_id}`)
            return draftVersion
        }
    }

    // 3. No draft exists - create new draft from published version
    const { data: publishedVersion, error: publishedError } = await supabase
        .from('website_section_versions')
        .select('*')
        .eq('id', section.published_version_id)
        .single()

    if (publishedError) {
        console.error('[getOrCreateDraftVersion] Error fetching published version:', publishedError)
        throw publishedError
    }

    // 4. Create new draft version (copy of published)
    const { data: newDraft, error: createError } = await supabase
        .from('website_section_versions')
        .insert({
            section_id: sectionId,
            status: 'draft',
            layout_json: publishedVersion.layout_json,
            content_html: publishedVersion.content_html,
            created_by: publishedVersion.created_by
        })
        .select()
        .single()

    if (createError) {
        console.error('[getOrCreateDraftVersion] Error creating draft:', createError)
        throw createError
    }

    // 5. Update section to point to new draft
    const { error: updateError } = await supabase
        .from('website_sections')
        .update({ draft_version_id: newDraft.id })
        .eq('id', sectionId)

    if (updateError) {
        console.error('[getOrCreateDraftVersion] Error updating section draft_version_id:', updateError)
        throw updateError
    }

    console.log(`[getOrCreateDraftVersion] Created new draft ${newDraft.id} for section ${sectionId}`)
    return newDraft
}

/**
 * Check if a section has unpublished changes
 */
export async function hasUnpublishedChanges(sectionId: string): Promise<boolean> {
    const supabase = await createAdminClient()

    const { data: section, error } = await supabase
        .from('website_sections')
        .select('published_version_id, draft_version_id')
        .eq('id', sectionId)
        .single()

    if (error || !section) return false

    // Has unpublished changes if draft exists and differs from published
    return section.draft_version_id !== null &&
        section.draft_version_id !== section.published_version_id
}

/**
 * Get count of sections with unpublished changes
 */
export async function getUnpublishedCount(): Promise<number> {
    const supabase = await createAdminClient()

    const { data: sections, error } = await supabase
        .from('website_sections')
        .select('id, published_version_id, draft_version_id')

    if (error || !sections) return 0

    return sections.filter(s =>
        s.draft_version_id !== null &&
        s.draft_version_id !== s.published_version_id
    ).length
}

/**
 * Publish all sections with unpublished changes
 * Promotes draft_version_id to published_version_id
 * Archives old published versions
 */
export async function publishAllChanges() {
    const supabase = await createAdminClient()

    // 1. Get all sections with unpublished changes
    const { data: sections, error: sectionsError } = await supabase
        .from('website_sections')
        .select('id, slug, published_version_id, draft_version_id')

    if (sectionsError) {
        console.error('[publishAllChanges] Error fetching sections:', sectionsError)
        throw sectionsError
    }

    const sectionsToPublish = sections?.filter(s =>
        s.draft_version_id && s.draft_version_id !== s.published_version_id
    ) || []

    if (sectionsToPublish.length === 0) {
        console.log('[publishAllChanges] No unpublished changes to publish')
        return { success: true, publishedCount: 0 }
    }

    console.log(`[publishAllChanges] Publishing ${sectionsToPublish.length} sections`)

    // 2. For each section, promote draft to published
    for (const section of sectionsToPublish) {
        // Archive old published version
        if (section.published_version_id) {
            await supabase
                .from('website_section_versions')
                .update({ status: 'archived' })
                .eq('id', section.published_version_id)
        }

        // Mark draft as published
        await supabase
            .from('website_section_versions')
            .update({ status: 'published' })
            .eq('id', section.draft_version_id)

        // Update section pointers
        await supabase
            .from('website_sections')
            .update({
                published_version_id: section.draft_version_id,
                draft_version_id: null  // Clear draft
            })
            .eq('id', section.id)

        console.log(`[publishAllChanges] Published section ${section.slug}`)
    }

    console.log(`[publishAllChanges] Successfully published ${sectionsToPublish.length} sections`)
    return { success: true, publishedCount: sectionsToPublish.length }
}
