'use client'

import React, { ReactNode, useRef } from 'react'
import { BlockProps } from '@/components/blocks/types'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useBlockDrag } from '@/lib/hooks/use-block-drag'
import { useBlockResize } from '@/lib/hooks/use-block-resize'
import { BlockFrame } from './block-frame'

interface EditorBlockWrapperProps {
    blockId: string
    blockType: string
    children: ReactNode
    className?: string
    block: BlockProps
    sectionId?: string
    layoutMode?: 'flow' | 'canvas'
}

export function EditorBlockWrapper({
    blockId,
    blockType,
    children,
    className,
    block,
    sectionId,
    layoutMode = 'flow'
}: EditorBlockWrapperProps) {
    const { isEditMode, selectedBlockId, setSelectedBlockId, blocks } = useEditorStore()
    const nodeRef = useRef<HTMLDivElement>(null)

    // Get current block state
    const currentBlock = blocks.find(b => b.id === blockId) || block
    const isHidden = currentBlock.is_enabled === false

    // Use extracted hooks
    const drag = useBlockDrag({ blockId, block: currentBlock, layoutMode, isEditMode })
    const { handleResizeStart } = useBlockResize({
        blockId,
        sectionId: sectionId || blockId,
        block: currentBlock,
        nodeRef,
        blockType
    })

    // Combine refs
    const setRefs = (node: HTMLDivElement | null) => {
        drag.setNodeRef(node)
        nodeRef.current = node
    }

    // Preview mode (no edit mode)
    if (!isEditMode) {
        if (isHidden) return null

        // Apply block type specific styling
        const blockStyle: React.CSSProperties = {
            ...drag.style,
            width: blockType === 'icon' ? currentBlock.width : drag.style.width,
            height: blockType === 'icon' ? currentBlock.height : drag.style.height,
            minHeight: blockType !== 'icon' ? currentBlock.minHeight : undefined,
        }

        return (
            <div ref={setRefs} className={className} style={blockStyle}>
                {children}
            </div>
        )
    }

    // Edit mode
    const blockStyle: React.CSSProperties = {
        ...drag.style,
        width: blockType === 'icon' ? currentBlock.width : drag.style.width,
        height: blockType === 'icon' ? currentBlock.height : drag.style.height,
        minHeight: blockType !== 'icon' ? currentBlock.minHeight : drag.style.minHeight,
    }

    return (
        <BlockFrame
            block={currentBlock}
            className={className}
            style={blockStyle}
            isSelected={selectedBlockId === blockId}
            isEditMode={isEditMode}
            isHidden={isHidden}
            isDragging={drag.isDragging}
            layoutMode={layoutMode}
            sectionId={sectionId}
            onSelect={() => setSelectedBlockId(blockId)}
            handleResizeStart={handleResizeStart}
            setRefs={setRefs}
            dragAttributes={drag.attributes}
            dragListeners={drag.listeners}
        >
            {children}
        </BlockFrame>
    )
}
