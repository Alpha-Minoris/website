'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { deleteChildBlock } from '@/actions/block-actions'
import { deleteSection } from '@/actions/section-actions'

export function KeyboardShortcuts() {
    const { isEditMode, selectedBlockId, blocks, removeBlock, setSelectedBlockId } = useEditorStore()

    useEffect(() => {
        if (!isEditMode || !selectedBlockId) return

        const handleKeyDown = async (e: KeyboardEvent) => {
            // Ignore if user is typing in an input or contentEditable
            const target = e.target as HTMLElement
            if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault()

                // Identify target type
                // 1. Is it a Section?
                const isSection = blocks.find(b => b.id === selectedBlockId)

                if (isSection) {
                    if (confirm("Are you sure you want to delete this section?")) {
                        await deleteSection(selectedBlockId)
                        removeBlock(selectedBlockId)
                        setSelectedBlockId(null)
                    }
                    return
                }

                // 2. Is it a Child Block?
                // Find parent section
                const parentSection = blocks.find(s =>
                    Array.isArray(s.content) && s.content.some((child: any) => child.id === selectedBlockId)
                )

                if (parentSection) {
                    try {
                        await deleteChildBlock(parentSection.id, selectedBlockId)
                        // Optimistically remove from store logic would be complex here due to nested update
                        // Rely on revalidatePath for now or we trigger a refetch?
                        // Actually, EditorStore 'blocks' is top level. WE need to update the parent section content in store.
                        // But verifying with revalidate is safer.
                        // Just clear selection.
                        setSelectedBlockId(null)
                    } catch (err) {
                        console.error("Failed to delete block", err)
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isEditMode, selectedBlockId, blocks, removeBlock, setSelectedBlockId])

    return null
}
