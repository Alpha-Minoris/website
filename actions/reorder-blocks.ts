'use server'

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Move a block (reorder or reparent) within a section
// Supports deep nesting by traversing the JSON tree
export async function moveBlock(sectionId: string, activeId: string, overId: string) {
    const supabase = await createAdminClient()

    // 1. Get Section & Version (Active/Published)
    const { data: section } = await supabase
        .from('website_sections')
        .select('published_version_id')
        .eq('id', sectionId)
        .single()

    if (!section?.published_version_id) {
        // Fallback: If no published version, check drafts or generic lookup?
        // But block-actions.ts relies on published_version_id.
        // Let's allow fallback to finding a 'draft' if published is null?
        // But for this slice, let's stick to strict linkage.
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
                // Insert movedBlock BEFORE the 'over' block (standard list behavior)
                if (movedBlock) newBlocks.push(movedBlock)
                newBlocks.push(block)
                continue
            }

            // Recurse first (to potentially insert inside)
            let processedChildren = block.content
            if (block.content && Array.isArray(block.content)) {
                processedChildren = insertIntoTree(block.content)
            }

            // Case 2: 'overId' IS this container
            // If we hovered over a Card (the container itself) and not a child.
            // But usually we hover over a child.
            // If the user drops *on* the Card border? 
            // dnd-kit usually interacts with Sortable items.
            // If the Card IS a Sortable item (it is), dropping ON IT implies swapping?
            // But if we want to drop INSIDE, we usually drop on a placeholder or exist item.
            // Let's assume 'overId' is where we want to place it *next to*.

            newBlocks.push({ ...block, content: processedChildren })
        }
        return newBlocks
    }

    // 2.1 Remove First
    const contentMinusBlock = removeFromTree(content)

    if (!movedBlock) {
        console.warn("Block to move not found in active version:", activeId)
        // If not found in JSON, maybe it was just added? 
        // Or mismatched IDs.
        return { success: false, error: "Block not found" }
    }

    // 2.2 Insert
    // Special check: If we just removed it, insert it back.
    const finalContent = insertIntoTree(contentMinusBlock)

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

    revalidatePath('/') // Revalidate all paths
    return { success: true }
}
