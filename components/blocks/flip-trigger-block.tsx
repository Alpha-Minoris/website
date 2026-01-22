'use client'

import React from 'react'
import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { updateBlockContent } from '@/actions/block-actions'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/stores/editor-store'

export function FlipTriggerBlock(block: BlockProps) {
    const { id, content, sectionId } = block
    const { isEditMode, setSelectedBlockId, updateBlock } = useEditorStore()
    const textContent = typeof content === 'string' ? content : "Learn more →"
    const action = block.action || 'flip' // flip | reverse

    return (
        <div
            className="w-fit"
            onClick={(e) => {
                e.stopPropagation()
                if (isEditMode) setSelectedBlockId(id)
            }}
        >
            <Button
                variant="link"
                className="p-0 h-auto font-semibold text-blue-500 hover:text-blue-400 group/btn transition-colors"
                onClick={(e) => {
                    e.stopPropagation()
                    // If in edit mode, wait for user to click link explicitly? 
                    // No, let's allow testing the flip even in edit mode if they click the button part, 
                    // but the usage of contentEditable makes it tricky.
                    // Ideally: separate Edit Mode vs Preview Mode. 
                    // For now, if clicking outside text span?

                    const eventName = action === 'reverse' ? 'card-flip-reverse' : 'card-flip-request'
                    const event = new CustomEvent(eventName, { bubbles: true })
                    e.currentTarget.dispatchEvent(event)
                }}
            >
                <span
                    className={cn(
                        "cursor-pointer outline-none border-b border-transparent focus:border-blue-500",
                        isEditMode && "hover:bg-white/5 px-1 rounded"
                    )}
                    contentEditable={isEditMode}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                        if (sectionId) {
                            const newText = e.currentTarget.textContent
                            updateBlock(id, { content: newText })
                        }
                    }}
                    onClick={(e) => {
                        if (isEditMode) {
                            e.stopPropagation() // Stop Button click from firing flip if we just want to edit text
                        }
                    }}
                >
                    {textContent}
                </span>
            </Button>
        </div>
    )
}


