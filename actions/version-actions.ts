'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * List all versions for a specific section, ordered by creation date
 */
export async function listAllVersions(sectionId: string) {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
        .from('website_section_versions')
        .select(`
            id,
            status,
            created_at,
            created_by,
            layout_json
        `)
        .eq('section_id', sectionId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[listAllVersions] Error:', error)
        throw error
    }

    return data
}

/**
 * Delete a specific version from history
 */
export async function deleteVersion(versionId: string) {
    const supabase = await createAdminClient()

    // Safety check: Don't delete currently active versions
    const { data: sectionMatches } = await supabase
        .from('website_sections')
        .select('id')
        .or(`published_version_id.eq.${versionId},draft_version_id.eq.${versionId}`)

    if (sectionMatches && sectionMatches.length > 0) {
        throw new Error("Cannot delete active section versions (published or draft).")
    }

    const { error } = await supabase
        .from('website_section_versions')
        .delete()
        .eq('id', versionId)

    if (error) {
        console.error('[deleteVersion] Error:', error)
        throw error
    }

    return { success: true }
}

/**
 * Create a full page backup (snapshot of all sections)
 * @param name - Human-readable name for the backup
 * @param options - Backup options
 * @param options.includePublished - Include published (production) versions (default: true)
 * @param options.includeDraft - Include draft (staging) versions (default: false)
 */
export async function createPageBackup(
    name: string,
    options: {
        includePublished?: boolean
        includeDraft?: boolean
    } = {}
) {
    const { includePublished = true, includeDraft = false } = options
    const supabase = await createAdminClient()

    // Build the select query dynamically based on options
    let selectFields = `
        id,
        title,
        published_version_id,
        draft_version_id
    `

    if (includePublished) {
        selectFields += `,
        website_section_versions_published:website_section_versions!website_sections_published_version_id_fkey (
            layout_json,
            content_html
        )`
    }

    if (includeDraft) {
        selectFields += `,
        website_section_versions_draft:website_section_versions!website_sections_draft_version_id_fkey (
            layout_json,
            content_html
        )`
    }

    // 1. Get all enabled sections with requested version data
    const { data: sections, error: sectionError } = await supabase
        .from('website_sections')
        .select(selectFields)
        .eq('is_enabled', true)
        .order('sort_order', { ascending: true })

    if (sectionError) throw sectionError

    // 2. Prepare snapshot
    const snapshot = (sections || []).map((s: any) => {
        const result: any = {
            section_id: s.id,
            title: s.title,
        }

        if (includePublished && s.published_version_id) {
            const publishedVersion = Array.isArray((s as any).website_section_versions_published)
                ? (s as any).website_section_versions_published[0]
                : (s as any).website_section_versions_published

            if (publishedVersion) {
                result.published_layout_json = publishedVersion.layout_json
                result.published_content_html = publishedVersion.content_html
            }
        }

        if (includeDraft && s.draft_version_id) {
            const draftVersion = Array.isArray((s as any).website_section_versions_draft)
                ? (s as any).website_section_versions_draft[0]
                : (s as any).website_section_versions_draft

            if (draftVersion) {
                result.draft_layout_json = draftVersion.layout_json
                result.draft_content_html = draftVersion.content_html
            }
        }

        return result
    })

    // Determine backup type
    const backupType = includePublished && includeDraft
        ? 'both'
        : includePublished
            ? 'published'
            : 'draft'

    // 3. Insert into backups
    const { data, error } = await supabase
        .from('website_backups')
        .insert({
            name,
            snapshot_json: snapshot,
            backup_type: backupType
        })
        .select()
        .single()

    if (error) {
        console.error('[createPageBackup] Error:', error)
        throw error
    }

    return data
}

/**
 * List all manual backups
 */
export async function listBackups() {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
        .from('website_backups')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Delete a manual backup
 */
export async function deleteBackup(backupId: string) {
    const supabase = await createAdminClient()
    const { error } = await supabase
        .from('website_backups')
        .delete()
        .eq('id', backupId)

    if (error) throw error
    return { success: true }
}

/**
 * Restore entire page from a backup
 * @param backupId - ID of the backup to restore
 * @param options - Restore options
 * @param options.restorePublished - Restore published (production) versions (default: true)
 * @param options.restoreDraft - Restore draft (staging) versions (default: false)
 */
export async function restoreFromBackup(
    backupId: string,
    options: {
        restorePublished?: boolean
        restoreDraft?: boolean
    } = {}
) {
    const { restorePublished = true, restoreDraft = false } = options
    const supabase = await createAdminClient()

    // 1. Get the backup
    const { data: backup, error: backupError } = await supabase
        .from('website_backups')
        .select('*')
        .eq('id', backupId)
        .single()

    if (backupError) throw backupError
    if (!backup.snapshot_json) throw new Error("Backup contains no data")

    const snapshots = backup.snapshot_json as any[]

    // 2. For each snapshot, restore requested versions
    for (const snap of snapshots) {
        const updates: any = {}

        // Restore published version
        if (restorePublished && snap.published_layout_json) {
            const { data: newPubVersion, error: createError } = await supabase
                .from('website_section_versions')
                .insert({
                    section_id: snap.section_id,
                    status: 'published',
                    layout_json: snap.published_layout_json,
                    content_html: snap.published_content_html
                })
                .select()
                .single()

            if (createError) {
                console.error(`[restoreFromBackup] Error creating published version for ${snap.section_id}:`, createError)
                continue
            }

            updates.published_version_id = newPubVersion.id
        }

        // Restore draft version
        if (restoreDraft && snap.draft_layout_json) {
            const { data: newDraftVersion, error: createError } = await supabase
                .from('website_section_versions')
                .insert({
                    section_id: snap.section_id,
                    status: 'draft',
                    layout_json: snap.draft_layout_json,
                    content_html: snap.draft_content_html
                })
                .select()
                .single()

            if (createError) {
                console.error(`[restoreFromBackup] Error creating draft version for ${snap.section_id}:`, createError)
                continue
            }

            updates.draft_version_id = newDraftVersion.id
        }

        // Apply updates only if we have something to update
        if (Object.keys(updates).length > 0) {
            await supabase
                .from('website_sections')
                .update(updates)
                .eq('id', snap.section_id)
        }
    }

    revalidatePath('/')
    return { success: true }
}

/**
 * Revert a specific section to a historical version
 */
export async function revertToVersion(versionId: string) {
    const supabase = await createAdminClient()

    // 1. Get the target historical version
    const { data: targetVersion, error: fetchError } = await supabase
        .from('website_section_versions')
        .select('*')
        .eq('id', versionId)
        .single()

    if (fetchError) throw fetchError

    // 2. Create a NEW version (copy of historical) to be the new published version
    // This maintains historical integrity (don't re-use IDs)
    const { data: newVersion, error: createError } = await supabase
        .from('website_section_versions')
        .insert({
            section_id: targetVersion.section_id,
            status: 'published',
            layout_json: targetVersion.layout_json,
            content_html: targetVersion.content_html,
            created_by: targetVersion.created_by
        })
        .select()
        .single()

    if (createError) throw createError

    // 3. Mark old published as archived
    const { data: section } = await supabase
        .from('website_sections')
        .select('published_version_id')
        .eq('id', targetVersion.section_id)
        .single()

    if (section?.published_version_id) {
        await supabase
            .from('website_section_versions')
            .update({ status: 'archived' })
            .eq('id', section.published_version_id)
    }

    // 4. Update section pointers
    await supabase
        .from('website_sections')
        .update({
            published_version_id: newVersion.id,
            draft_version_id: null // Clear draft so it syncs with published
        })
        .eq('id', targetVersion.section_id)

    revalidatePath('/')
    return { success: true }
}
