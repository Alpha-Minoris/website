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
 */
export async function createPageBackup(name: string) {
    const supabase = await createAdminClient()

    // 1. Get all published sections
    const { data: sections, error: sectionError } = await supabase
        .from('website_sections')
        .select(`
            id,
            title,
            published_version_id,
            website_section_versions!website_sections_published_version_id_fkey (
                layout_json,
                content_html
            )
        `)
        .eq('is_enabled', true)
        .order('display_order', { ascending: true })

    if (sectionError) throw sectionError

    // 2. Prepare snapshot
    const snapshot = sections.map(s => {
        const version = Array.isArray(s.website_section_versions)
            ? s.website_section_versions[0]
            : (s.website_section_versions as any)

        return {
            section_id: s.id,
            title: s.title,
            layout_json: version?.layout_json,
            content_html: version?.content_html
        }
    })

    // 3. Insert into backups
    const { data, error } = await supabase
        .from('website_backups')
        .insert({
            name,
            snapshot_json: snapshot
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

    // 2. For each snapshot, create a new version and set as published
    for (const snap of snapshots) {
        // Create new version
        const { data: newVersion, error: createError } = await supabase
            .from('website_section_versions')
            .insert({
                section_id: snap.section_id,
                status: 'published',
                layout_json: snap.layout_json,
                content_html: snap.content_html
            })
            .select()
            .single()

        if (createError) {
            console.error(`[restoreFromBackup] Error creating version for ${snap.section_id}:`, createError)
            continue
        }

        // Update section pointers
        await supabase
            .from('website_sections')
            .update({
                published_version_id: newVersion.id,
                draft_version_id: null // Reset draft to match restored published
            })
            .eq('id', snap.section_id)
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
