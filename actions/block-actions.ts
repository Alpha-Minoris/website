'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Update a block (can be nested deeply).
// For recursive updates, we need to traverse the JSON.
export async function updateBlock(blockId: string, updates: any) {
    const supabase = await createAdminClient()

    // 1. Find the section that contains this block (deep search)
    // Query sections to find which one stores this block ID in its layout_json
    // This is expensive if we don't have the sectionId from the client.
    // Ideally, the client SHOULD pass sectionId.
    // If blockId IS the sectionId, handle that.

    // Check if blockId is a section first
    const { data: isSection } = await supabase.from('website_sections').select('id, published_version_id').eq('id', blockId).single()

    if (isSection) {
        // Direct Section Update
        const { data: version } = await supabase
            .from('website_section_versions')
            .select('layout_json')
            .eq('id', isSection.published_version_id)
            .single()

        const currentLayout = version?.layout_json || {}
        const newLayout = { ...currentLayout, ...updates }

        const { error } = await supabase
            .from('website_section_versions')
            .update({ layout_json: newLayout })
            .eq('id', isSection.published_version_id)

        if (error) throw error
        revalidatePath('/')
        return { success: true }
    }

    // If not a section, find the section containing the block
    /* 
      SQL based search for JSON containment is hard for deep nested.
      We'll iterate common sections or assume client passes sectionId?
      The tool call `updateBlock(blockId, updates)` unfortunately often lacks sectionId in generic signatures.
      But `updateBlockContent` HAS sectionId.
      Let's use `updateBlockContent` logic if we can find the section.
      
      For now, we'll try to find the section by checking all? 
      Or better, let's update the actions to REQUIRE sectionId or fix the client to always use `updateBlockContent` for children.
      The Error "Section not found" came from line 26 of original code which assumed blockId WAS sectionId.
      
      FIX: Convert `updateBlock` to support finding the parent section if not provided, OR fail gracefully.
      But wait, the `CardToolbar` calls `updateBlock` with `blockId`. 
      If `CardToolbar` is given `sectionId` prop, it should use a different action or pass it?
      Actually `CardToolbar` calls `updateBlock` imported from `@/actions/block-actions`.
      
      The fix is to make `updateBlock` smarter:
      If blockId matches a SECTION, update section.
      If not, SEARCH for the section containing the block.
    */

    // Search all published versions for this block ID
    const { data: allVersions } = await supabase
        .from('website_section_versions')
        .select('id, section_id, layout_json')
        .eq('status', 'published')

    let foundVersion = null
    let foundBlockPath: any = null // Not used yet

    // Simple Recursive Finder
    const findBlockInTree = (blocks: any[], targetId: string): boolean => {
        for (const b of blocks) {
            if (b.id === targetId) return true
            if (Array.isArray(b.content)) {
                if (findBlockInTree(b.content, targetId)) return true
            }
            // check back content if any
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

    if (!foundVersion) throw new Error("Block's container section not found")

    // Now update recursively
    const updateRecursive = (blocks: any[]): any[] => {
        return blocks.map(b => {
            if (b.id === blockId) {
                return { ...b, ...updates, id: blockId } // Ensure ID persist
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

    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', foundVersion.id)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
}

// Add a child block to a section OR nested container
export async function addChildBlock(parentId: string, newBlock: any, targetField: 'content' | 'backContent' = 'content') {
    const supabase = await createAdminClient()

    // 1. Search for the Section Version containing 'parentId' (either as section ID or block ID)
    const { data: allVersions } = await supabase
        .from('website_section_versions')
        .select('id, section_id, layout_json')
        .eq('status', 'published')

    let targetVersion = null
    let targetIsRoot = false

    // Check if parentId Is the section ID itself (simplified from version check)
    if (allVersions) {
        // Optimization: Pre-check if parentId matches any section directly
        // But we only have version IDs here. 
        // Let's iterate
        for (const v of allVersions) {
            if (v.section_id === parentId) {
                targetVersion = v
                targetIsRoot = true
                break
            }
            // Check content tree
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
                break
            }
        }
    }

    if (!targetVersion) throw new Error("Target container not found")

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
    revalidatePath('/')
    return { success: true }
}

// Update a specific child block within a section (Recursive)
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
        .eq('id', section.published_version_id)

    if (error) throw error

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
