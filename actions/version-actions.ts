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
        website_section_versions_published:website_section_versions!fk_published_version (
            layout_json,
            content_html
        )`
    }

    if (includeDraft) {
        selectFields += `,
        website_section_versions_draft:website_section_versions!fk_draft_version (
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
 * Import a backup from uploaded JSON
 * @param name - Name for the backup
 * @param snapshotJson - The snapshot data from uploaded JSON file
 * @param backupType - Whether this backup was from 'published' or 'draft'
 */
export async function importBackupFromJson(
    name: string,
    snapshotJson: any[],
    backupType: 'published' | 'draft'
) {
    const supabase = await createAdminClient()

    // Validate the snapshot structure
    if (!Array.isArray(snapshotJson)) {
        throw new Error('Invalid backup format: expected an array of sections')
    }

    // Basic validation of each section
    for (const section of snapshotJson) {
        if (!section.section_id && !section.title) {
            throw new Error('Invalid backup format: each section must have section_id or title')
        }
    }

    const { data, error } = await supabase
        .from('website_backups')
        .insert({
            name: `[Imported] ${name}`,
            snapshot_json: snapshotJson,
            backup_type: backupType
        })
        .select()
        .single()

    if (error) {
        console.error('[importBackupFromJson] Error:', error)
        throw error
    }

    return data
}

/**
 * Restore entire page from a backup - ALWAYS restores as DRAFT for safety
 * The backup_type indicates the SOURCE of the snapshot (published or draft),
 * but restoration is always to draft. User can then publish if satisfied.
 * @param backupId - ID of the backup to restore
 */
export async function restoreFromBackup(backupId: string) {
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
    const backupType = backup.backup_type as 'published' | 'draft' | 'both'

    // 2. For each snapshot, restore as DRAFT
    for (const snap of snapshots) {
        // Determine which layout to use - prefer matching backup_type, fallback to other
        let layoutJson = null
        let contentHtml = null

        if (backupType === 'published' && snap.published_layout_json) {
            layoutJson = snap.published_layout_json
            contentHtml = snap.published_content_html
        } else if (backupType === 'draft' && snap.draft_layout_json) {
            layoutJson = snap.draft_layout_json
            contentHtml = snap.draft_content_html
        } else if (snap.published_layout_json) {
            // Fallback to published if available
            layoutJson = snap.published_layout_json
            contentHtml = snap.published_content_html
        } else if (snap.draft_layout_json) {
            // Fallback to draft if available
            layoutJson = snap.draft_layout_json
            contentHtml = snap.draft_content_html
        }

        if (!layoutJson) {
            console.warn(`[restoreFromBackup] No layout data for section ${snap.section_id}, skipping`)
            continue
        }

        // Create new DRAFT version
        const { data: newDraftVersion, error: createError } = await supabase
            .from('website_section_versions')
            .insert({
                section_id: snap.section_id,
                status: 'draft',
                layout_json: layoutJson,
                content_html: contentHtml
            })
            .select()
            .single()

        if (createError) {
            console.error(`[restoreFromBackup] Error creating draft version for ${snap.section_id}:`, createError)
            continue
        }

        // Update section to point to new draft
        await supabase
            .from('website_sections')
            .update({ draft_version_id: newDraftVersion.id })
            .eq('id', snap.section_id)
    }

    revalidatePath('/')
    revalidatePath('/edit')
    return { success: true, restoredAsDraft: true }
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
