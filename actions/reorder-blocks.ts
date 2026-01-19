'use server'

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkEditRights } from "@/lib/auth-utils"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Move a block (reorder or reparent) within a section
// Supports deep nesting by traversing the JSON tree
export async function moveBlock(sectionId: string, activeId: string, overId: string, newSettings?: any) {
    if (!(await checkEditRights({ sectionId, actionType: 'update' }))) {
        throw new Error('Unauthorized')
    }
    console.log(`[moveBlock] START sectionId=${sectionId}, activeId=${activeId}, overId=${overId}`)
    if (!sectionId || !activeId || !overId) {
        console.error(`[moveBlock] Missing arguments: sectionId=${sectionId}, activeId=${activeId}, overId=${overId}`)
        throw new Error("All IDs are required for moveBlock")
    }
    const supabase = await createAdminClient()

    // 1. Get Section & Version (Active/Published)
    const isUuid = UUID_REGEX.test(sectionId)
    console.log(`[moveBlock] isUuid(sectionId)=${isUuid}`)

    let query = supabase.from('website_sections').select('published_version_id, slug')
    if (isUuid) {
        query = query.eq('id', sectionId)
    } else {
        query = query.eq('slug', sectionId)
    }

    const { data: sectionRow, error: sectionError } = await query.single()

    if (sectionError) {
        console.error(`[moveBlock] Section query error for ${sectionId}:`, sectionError)
        throw sectionError
    }

    if (!sectionRow?.published_version_id) {
        console.error(`[moveBlock] Published version not found for section ${sectionId}`)
        throw new Error("Section version not found")
    }

    console.log(`[moveBlock] Using version ${sectionRow.published_version_id} for section ${sectionRow.slug}`)

    const { data: version, error: versionError } = await supabase
        .from('website_section_versions')
        .select('layout_json')
        .eq('id', sectionRow.published_version_id)
        .single()

    if (versionError) {
        console.error(`[moveBlock] Error fetching version ${sectionRow.published_version_id}:`, versionError)
        throw versionError
    }

    const currentLayout = version?.layout_json || {}
    const content = (currentLayout.content as any[]) || []

    // 2. Recursive Helpers
    let movedBlock: any = null

    // Remove block from tree
    const removeFromTree = (blocks: any[]): any[] => {
        const filtered = []
        for (const block of blocks) {
            if (block.id === activeId) {
                movedBlock = block // Capture it
                if (newSettings) {
                    // Apply new settings (e.g. reparented relative coordinates)
                    movedBlock.settings = { ...movedBlock.settings, ...newSettings }
                }
                continue
            }
            // Recurse if children exist (e.g. Card)
            if (block.content && Array.isArray(block.content)) {
                block.content = removeFromTree(block.content)
            }
            filtered.push(block)
        }
        return filtered
    }

    // Insert block relative to 'overId'
    const insertIntoTree = (blocks: any[]): any[] => {
        const newBlocks = []
        for (const block of blocks) {
            // Case 1: 'overId' is a sibling
            if (block.id === overId) {
                // If the target is a Container (Card) and we want to drop INSIDE? 
                // Simple heuristic: If overId is a Card and we're not sorting (requires valid strategy?), assume append?
                // For now, adhere to explicit behavior:
                // If overId matches, we insert BEFORE (standard sortable).
                // To Insert INSIDE, we should rely on recursion finding a child? 
                // OR we check if 'block' is the container we targeted.

                // If we dropped ON a card (Canvas Mode Reparenting), we want to go inside.
                if ((block.type === 'card' || block.type === 'container') && block.content) {
                    // Check if we really meant to drop inside. 
                    // Since we handle "Drop on Card" in frontend, we probably want inside.
                    // Append movedBlock to block.content
                    if (movedBlock) {
                        block.content = [...(block.content || []), movedBlock]
                        movedBlock = null // Mark as placed
                    }
                    newBlocks.push(block)
                    continue
                }

                if (movedBlock) newBlocks.push(movedBlock)
                newBlocks.push(block)
                continue
            }

            // Recurse first
            let processedChildren = block.content
            if (block.content && Array.isArray(block.content)) {
                processedChildren = insertIntoTree(block.content)
            }

            newBlocks.push({ ...block, content: processedChildren })
        }
        return newBlocks
    }

    // 2.1 Remove First (and update settings)
    const contentMinusBlock = removeFromTree(content)

    if (!movedBlock) {
        return { success: false, error: "Block not found" }
    }

    // Check if we're un-nesting: overId equals sectionId means move to root
    let finalContent: any[]
    if (overId === sectionId) {
        // Un-nesting: append to root content array
        finalContent = [...contentMinusBlock, movedBlock]
        movedBlock = null // Mark as placed
    } else {
        // 2.2 Insert relative to overId
        finalContent = insertIntoTree(contentMinusBlock)

        // Fallback: If not placed (e.g. overId not found), append to root
        if (movedBlock) {
            finalContent.push(movedBlock)
        }
    }

    // Save
    const newLayout = {
        ...currentLayout,
        content: finalContent
    }

    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', sectionRow.published_version_id)

    if (error) throw error

    revalidatePath('/')
    return { success: true }
}
