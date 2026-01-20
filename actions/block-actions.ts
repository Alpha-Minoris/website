'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getOrCreateDraftVersion } from '@/lib/staging/staging-utils'

// Update a block (can be nested deeply).
// For recursive updates, we need to traverse the JSON.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function updateBlock(blockId: string, updates: any) {
    console.log(`[updateBlock] START blockId=${blockId}`)
    const supabase = await createAdminClient()

    // 1. Check if blockId is a UUID. If not, treat as a slug.
    const isUuid = UUID_REGEX.test(blockId)
    console.log(`[updateBlock] isUuid=${isUuid}`)

    // Check if blockId matches a section
    let query = supabase.from('website_sections').select('id, published_version_id, slug')
    if (isUuid) {
        query = query.eq('id', blockId)
    } else {
        query = query.eq('slug', blockId)
    }

    const { data: sectionRow, error: sectionError } = await query.single()

    if (sectionError && sectionError.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error(`[updateBlock] Section query error:`, sectionError)
        // If we get 22P02 here, it means the query itself was invalid
        if (sectionError.code === '22P02') {
            console.error(`[updateBlock] 22P02 detected during section query for ${blockId}. Attempting fallback to search.`)
        } else {
            throw sectionError
        }
    }

    if (sectionRow) {
        console.log(`[updateBlock] Match found in website_sections: slug=${sectionRow.slug}, version_id=${sectionRow.published_version_id}`)

        if (!sectionRow.published_version_id) {
            console.error(`[updateBlock] Section found but has no published_version_id`)
            throw new Error("Section has no published version")
        }

        // Get or create draft version for this section
        const draftVersion = await getOrCreateDraftVersion(sectionRow.id)
        console.log(`[updateBlock] Using draft version ${draftVersion.id}`)

        const currentLayout = draftVersion.layout_json || {}
        const newLayout = { ...currentLayout, ...updates }

        const { error: updateError } = await supabase
            .from('website_section_versions')
            .update({ layout_json: newLayout })
            .eq('id', draftVersion.id)

        if (updateError) {
            console.error(`[updateBlock] Error updating draft version ${draftVersion.id}:`, updateError)
            throw updateError
        }

        console.log(`[updateBlock] Success: Updated draft version ${draftVersion.id}`)
        // NO revalidatePath here - only on publish!
        return { success: true }
    }

    console.log(`[updateBlock] No direct section match for ${blockId}. Searching nested content...`)

    // If not a section, find the section containing the block
    const { data: allVersions, error: allVersionsError } = await supabase
        .from('website_section_versions')
        .select('id, section_id, layout_json')
        .eq('status', 'published')

    if (allVersionsError) {
        console.error(`[updateBlock] Error fetching all versions:`, allVersionsError)
        throw allVersionsError
    }

    let foundVersion = null
    const findBlockInTree = (blocks: any[], targetId: string): boolean => {
        for (const b of blocks) {
            if (b.id === targetId) return true
            if (Array.isArray(b.content)) {
                if (findBlockInTree(b.content, targetId)) return true
            }
            if (b.settings && Array.isArray(b.settings.backContent)) {
                if (findBlockInTree(b.settings.backContent, targetId)) return true
            }
        }
        return false
    }

    if (allVersions) {
        for (const v of allVersions) {
            const content = Array.isArray(v.layout_json?.content) ? v.layout_json.content : []
            if (findBlockInTree(content, blockId)) {
                foundVersion = v
                break
            }
        }
    }

    if (!foundVersion) {
        console.error(`[updateBlock] Block ${blockId} not found in any published section tree.`)
        throw new Error("Block's container section not found")
    }

    console.log(`[updateBlock] Block found in version ${foundVersion.id} (section ID: ${foundVersion.section_id})`)

    const updateRecursive = (blocks: any[]): any[] => {
        return blocks.map(b => {
            if (b.id === blockId) {
                return { ...b, ...updates, id: blockId }
            }
            if (Array.isArray(b.content)) {
                b.content = updateRecursive(b.content)
            }
            if (b.settings && Array.isArray(b.settings.backContent)) {
                b.settings.backContent = updateRecursive(b.settings.backContent)
            }
            return b
        })
    }

    const currentContent = Array.isArray(foundVersion.layout_json?.content) ? foundVersion.layout_json.content : []
    const newContent = updateRecursive(currentContent)
    const newLayout = { ...(foundVersion.layout_json || {}), content: newContent }

    const { error: finalUpdateError } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', foundVersion.id)

    if (finalUpdateError) {
        console.error(`[updateBlock] Error saving nested update to version ${foundVersion.id}:`, finalUpdateError)
        throw finalUpdateError
    }

    console.log(`[updateBlock] Success: Recursive update for ${blockId}`)
    revalidatePath('/')
    return { success: true }
}

// Add a child block to a section OR nested container
export async function addChildBlock(parentId: string, newBlock: any, targetField: 'content' | 'backContent' = 'content') {
    console.log(`[addChildBlock] START parentId=${parentId}, targetField=${targetField}`)
    const supabase = await createAdminClient()

    // 1. Search for the Section Version containing 'parentId'
    const { data: allVersions, error: fetchError } = await supabase
        .from('website_section_versions')
        .select('id, section_id, layout_json')
        .eq('status', 'draft')

    if (fetchError) {
        console.error(`[addChildBlock] Error fetching versions:`, fetchError)
        throw fetchError
    }

    let targetVersion = null
    let targetIsRoot = false

    if (allVersions) {
        for (const v of allVersions) {
            if (v.section_id === parentId) {
                targetVersion = v
                targetIsRoot = true
                console.log(`[addChildBlock] Found target as root of section ${v.section_id}`)
                break
            }
            const content = Array.isArray(v.layout_json?.content) ? v.layout_json.content : []
            const matches = (blocks: any[]): boolean => {
                for (const b of blocks) {
                    if (b.id === parentId) return true
                    if (Array.isArray(b.content) && matches(b.content)) return true
                    if (b.settings?.backContent && matches(b.settings.backContent)) return true
                }
                return false
            }
            if (matches(content)) {
                targetVersion = v
                targetIsRoot = false
                console.log(`[addChildBlock] Found target nested in section version ${v.id}`)
                break
            }
        }
    }

    if (!targetVersion) {
        console.error(`[addChildBlock] Target container ${parentId} not found in any draft section.`)
        throw new Error("Target container not found")
    }

    // 2. Insert Logic
    const currentLayout = targetVersion.layout_json || {}
    let newContent = []

    if (targetIsRoot) {
        newContent = [...(currentLayout.content || []), newBlock]
    } else {
        // Recursive Insertion
        const insertRecursive = (blocks: any[]): any[] => {
            return blocks.map(b => {
                if (b.id === parentId) {
                    // Found the container block!
                    // Check if we are targeting backContent
                    if (targetField === 'backContent') {
                        const currentBack = Array.isArray(b.settings?.backContent) ? b.settings.backContent : []
                        return {
                            ...b,
                            settings: {
                                ...b.settings,
                                backContent: [...currentBack, newBlock]
                            }
                        }
                    }
                    // Default to content
                    const childContent = Array.isArray(b.content) ? b.content : []
                    return { ...b, content: [...childContent, newBlock] }
                }
                if (Array.isArray(b.content)) {
                    return { ...b, content: insertRecursive(b.content) }
                }
                if (b.settings?.backContent) {
                    return { ...b, settings: { ...b.settings, backContent: insertRecursive(b.settings.backContent) } }
                }
                return b
            })
        }
        newContent = insertRecursive(currentLayout.content || [])
    }

    const newLayout = { ...currentLayout, content: newContent }

    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', targetVersion.id)

    if (error) throw error

    console.log(`[addChildBlock] Success: Added to draft version ${targetVersion.id}`)
    // NO revalidatePath - only on publish!
    return { success: true }
}

// Update a specific child block within a section (Recursive)
export async function updateBlockContent(sectionId: string, blockId: string, updates: any) {
    console.log(`[updateBlockContent] START sectionId=${sectionId}, blockId=${blockId}`)
    if (!sectionId || !blockId) {
        console.error(`[updateBlockContent] Missing IDs: sectionId=${sectionId}, blockId=${blockId}`)
        throw new Error("Section ID and Block ID are required")
    }
    const supabase = await createAdminClient()

    // 1. Get current section version
    const isUuid = UUID_REGEX.test(sectionId)
    console.log(`[updateBlockContent] isUuid(sectionId)=${isUuid}`)

    let query = supabase.from('website_sections').select('id, published_version_id, slug')
    if (isUuid) {
        query = query.eq('id', sectionId)
    } else {
        query = query.eq('slug', sectionId)
    }

    const { data: sectionRow, error: sectionError } = await query.single()

    if (sectionError) {
        console.error(`[updateBlockContent] Section query error for ${sectionId}:`, sectionError)
        throw sectionError
    }

    if (!sectionRow || !sectionRow.published_version_id) {
        console.error(`[updateBlockContent] Section or version not found for ${sectionId}`)
        throw new Error("Section or version not found")
    }

    console.log(`[updateBlockContent] Using section ${sectionRow.slug}`)

    // Get or create draft version
    const draftVersion = await getOrCreateDraftVersion(sectionRow.id)
    console.log(`[updateBlockContent] Using draft version ${draftVersion.id}`)

    const currentLayout = draftVersion.layout_json || {}
    const content = Array.isArray(currentLayout.content) ? currentLayout.content : []

    // 2. Recursive Update Helper
    let found = false
    const updateRecursive = (blocks: any[]): any[] => {
        return blocks.map(b => {
            // Direct Match
            if (b.id === blockId) {
                found = true
                return {
                    ...b,
                    ...updates,
                    id: blockId, // Safety
                    type: b.type
                }
            }

            // Nested Content
            if (Array.isArray(b.content)) {
                return { ...b, content: updateRecursive(b.content) }
            }

            // Back Content (Flip Cards)
            if (b.settings && Array.isArray(b.settings.backContent)) {
                return {
                    ...b,
                    settings: {
                        ...b.settings,
                        backContent: updateRecursive(b.settings.backContent)
                    }
                }
            }

            return b
        })
    }

    const newContent = updateRecursive(content)

    if (!found) throw new Error("Block not found in section (deep search failed)")

    // 3. Save back
    const newLayout = {
        ...currentLayout,
        content: newContent
    }

    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', draftVersion.id)

    if (error) throw error

    console.log(`[updateBlockContent] Success: Updated draft version ${draftVersion.id}`)
    // NO revalidatePath - only on publish!
    return { success: true }
}

// Delete a child block from a section
export async function deleteChildBlock(sectionId: string, blockId: string) {
    console.log(`[deleteChildBlock] START sectionId=${sectionId}, blockId=${blockId}`)
    if (!sectionId || !blockId) {
        console.error(`[deleteChildBlock] Missing IDs: sectionId=${sectionId}, blockId=${blockId}`)
        throw new Error("Section ID and Block ID are required")
    }
    const supabase = await createAdminClient()

    const isUuid = UUID_REGEX.test(sectionId)

    let query = supabase.from('website_sections').select('id, published_version_id, slug')
    if (isUuid) {
        query = query.eq('id', sectionId)
    } else {
        query = query.eq('slug', sectionId)
    }

    const { data: sectionRow, error: sectionError } = await query.single()

    if (sectionError) {
        console.error(`[deleteChildBlock] Section query error for ${sectionId}:`, sectionError)
        throw sectionError
    }

    if (!sectionRow?.published_version_id) {
        console.error(`[deleteChildBlock] Published version not found for section ${sectionId}`)
        throw new Error("Section version not found")
    }

    console.log(`[deleteChildBlock] Updating section ${sectionRow.slug}`)

    // Get or create draft version
    const draftVersion = await getOrCreateDraftVersion(sectionRow.id)
    console.log(`[deleteChildBlock] Using draft version ${draftVersion.id}`)

    const currentLayout = draftVersion.layout_json || {}
    const content = Array.isArray(currentLayout.content) ? currentLayout.content : []

    const newContent = content.filter((b: any) => b.id !== blockId)

    const newLayout = {
        ...currentLayout,
        content: newContent
    }

    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', draftVersion.id)

    if (error) throw error

    console.log(`[deleteChildBlock] Success: Updated draft version ${draftVersion.id}`)
    // NO revalidatePath - only on publish!
    return { success: true }
}
