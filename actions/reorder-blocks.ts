'use server'

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Move a block (reorder or reparent) within a section
// Supports deep nesting by traversing the JSON tree
export async function moveBlock(sectionId: string, activeId: string, overId: string, newSettings?: any) {
    const supabase = await createAdminClient()

    // 1. Get Section & Version (Active/Published)
    const { data: section } = await supabase
        .from('website_sections')
        .select('published_version_id')
        .eq('id', sectionId)
        .single()

    if (!section?.published_version_id) {
        throw new Error("Section version not found")
    }

    const { data: version } = await supabase
        .from('website_section_versions')
        .select('layout_json')
        .eq('id', section.published_version_id)
        .single()

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

    // 2.2 Insert
    let finalContent = insertIntoTree(contentMinusBlock)

    // Fallback: If not placed (e.g. overId not found or handled), append to root
    // This handles "Drop on Cell" where overId is a virtual ID, moving the block to the top level.
    if (movedBlock) {
        finalContent.push(movedBlock)
    }

    // Save
    const newLayout = {
        ...currentLayout,
        content: finalContent
    }

    const { error } = await supabase
        .from('website_section_versions')
        .update({ layout_json: newLayout })
        .eq('id', section.published_version_id)

    if (error) throw error

    revalidatePath('/')
    return { success: true }
}
