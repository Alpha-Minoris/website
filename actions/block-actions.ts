'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Generic update for any block/section properties
export async function updateBlock(blockId: string, updates: any) {
    const supabase = await createAdminClient()

    // In our current flat "Sections" model, 'blockId' is the Section ID.
    // We update the row in 'website_section_versions' for that section.
    // Wait, 'website_sections' has the ID. 'website_section_versions' links to it.
    // We need to find the *draft* version to update, or create a new draft if published.
    // For this Vertical Slice, let's assume we are editing the 'published' version directly for speed,
    // OR essentially "Auto-Saving" to a draft.

    // Simplification: Update the 'layout_json' or specific fields of the ACTIVE version.

    // 1. Find the section to get its active version
    const { data: section } = await supabase
        .from('website_sections')
        .select('published_version_id')
        .eq('id', blockId)
        .single()

    if (!section) throw new Error("Section not found")

    // 2. Update that version
    // Note: In a real app, we'd check if it's locked/published and fork it.
    // Here, we just patch the JSON.
    /*
      updates = { 
        settings: { ... }, 
        content: [ ... ] 
      }
    */

    // We need to fetch the current data to merge? 
    // Or we assume the client sends the full new state for that field.
    // Let's assume 'updates' is a partial object mapping to columns or JSON keys.

    // Actually, 'BlockProps' has { settings, content }.
    // We map these to the DB columns.
    // table: website_section_versions
    // columns: layout_json (for settings?), content_html? 
    // The schema has 'layout_json', 'meta_json', 'content_html'.

    // Convention: 
    // 'settings' -> layout_json.settings
    // 'content' -> layout_json.content (if it's a JSON tree)

    // Let's fetch the current layout_json
    const { data: version } = await supabase
        .from('website_section_versions')
        .select('layout_json')
        .eq('id', section.published_version_id)
        .single()

    const currentLayout = version?.layout_json || {}

    const newLayout = {
        ...currentLayout,
        ...updates // Merge top-level keys like 'settings', 'content'
    }

    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', section.published_version_id)

    if (error) throw error

    revalidatePath('/')
    return { success: true }
}

// Add a child block to a section
export async function addChildBlock(parentId: string, newBlock: any) {
    const supabase = await createAdminClient()

    // 1. Get current section data
    const { data: section } = await supabase
        .from('website_sections')
        .select('published_version_id')
        .eq('id', parentId)
        .single()

    if (!section) throw new Error("Parent Section not found")

    let versionId = section.published_version_id

    if (!versionId) {
        // Fallback: Try to find a published version for this section
        const { data: fallbackVersion } = await supabase
            .from('website_section_versions')
            .select('id')
            .eq('section_id', parentId)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (fallbackVersion) {
            versionId = fallbackVersion.id
            // Optional: Repair the link
            await supabase.from('website_sections').update({ published_version_id: versionId }).eq('id', parentId)
        } else {
            // If still no version, create one? For now throw.
            throw new Error("No published version found for this section")
        }
    }

    // 2. Get current content
    const { data: version } = await supabase
        .from('website_section_versions')
        .select('layout_json')
        .eq('id', versionId)
        .single()

    const currentLayout = version?.layout_json || {}
    const currentContent = Array.isArray(currentLayout.content) ? currentLayout.content : []

    // 3. Append new block
    const updatedContent = [...currentContent, newBlock]

    const newLayout = {
        ...currentLayout,
        content: updatedContent
    }

    // 4. Save
    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', versionId)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/')
    return { success: true }
}

// Update a specific child block within a section
export async function updateBlockContent(sectionId: string, blockId: string, updates: any) {
    const supabase = await createAdminClient()

    // 1. Get current section version
    const { data: section } = await supabase
        .from('website_sections')
        .select('published_version_id')
        .eq('id', sectionId)
        .single()

    if (!section || !section.published_version_id) throw new Error("Section or version not found")

    const { data: version } = await supabase
        .from('website_section_versions')
        .select('layout_json')
        .eq('id', section.published_version_id)
        .single()

    const currentLayout = version?.layout_json || {}
    const content = Array.isArray(currentLayout.content) ? currentLayout.content : []

    // 2. Find and update the specific block
    const blockIndex = content.findIndex((b: any) => b.id === blockId)
    if (blockIndex === -1) throw new Error("Block not found in section")

    const updatedBlock = {
        ...content[blockIndex],
        ...updates,
        // Ensure ID and Type don't get overwritten accidentally unless intended
        id: blockId,
        type: content[blockIndex].type
    }

    const newContent = [...content]
    newContent[blockIndex] = updatedBlock

    // 3. Save back
    const newLayout = {
        ...currentLayout,
        content: newContent
    }

    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', section.published_version_id)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/')
    return { success: true }
}

// Delete a child block from a section
export async function deleteChildBlock(sectionId: string, blockId: string) {
    const supabase = await createAdminClient()

    const { data: section } = await supabase
        .from('website_sections')
        .select('published_version_id')
        .eq('id', sectionId)
        .single()

    if (!section?.published_version_id) throw new Error("Section version not found")

    const { data: version } = await supabase
        .from('website_section_versions')
        .select('layout_json')
        .eq('id', section.published_version_id)
        .single()

    const currentLayout = version?.layout_json || {}
    const content = Array.isArray(currentLayout.content) ? currentLayout.content : []

    const newContent = content.filter((b: any) => b.id !== blockId)

    const newLayout = {
        ...currentLayout,
        content: newContent
    }

    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', section.published_version_id)

    if (error) throw error

    revalidatePath('/')
    return { success: true }
}
