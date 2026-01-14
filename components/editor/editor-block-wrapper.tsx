'use client'

import { ReactNode } from 'react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'
import { FloatingToolbar } from './floating-toolbar'
import { TextToolbar } from './text-toolbar'

interface EditorBlockWrapperProps {
    blockId: string
    blockType: string
    children: ReactNode
    className?: string
}

export function EditorBlockWrapper({ blockId, blockType, children, className }: EditorBlockWrapperProps) {
    const { isEditMode, selectedBlockId, setSelectedBlockId } = useEditorStore()

    if (!isEditMode) {
        return <div className={className}>{children}</div>
    }

    const isSelected = selectedBlockId === blockId

    const isContentBlock = ['heading', 'paragraph', 'button', 'rich-text'].includes(blockType)

    return (
        <div
            className={cn(
                "relative transition-all duration-200 group border-2",
                isSelected
                    ? "border-blue-500 z-10"
                    : "border-transparent hover:border-blue-500/50",
                className
            )}
            onClick={(e) => {
                e.stopPropagation()
                setSelectedBlockId(blockId)
            }}
        >
            {isSelected && (
                <>
                    {/* Only show Section Toolbar for layout blocks */}
                    {!isContentBlock &&
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-2 z-50">
                            <FloatingToolbar id={blockId} />
                        </div>
                    }

                    {/* Only show Text Toolbar for content blocks */}
                    {isContentBlock &&
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                            <TextToolbar blockId={blockId} />
                        </div>
                    }
                </>
            )}



            {children}
        </div>
    )
}
