'use client'

import React, { ReactNode } from 'react'
import { BlockProps } from '@/components/blocks/types'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'
import { BlockToolbars } from './block-toolbars'
import { BlockResizeHandles } from './block-resize-handles'

interface BlockFrameProps {
    block: BlockProps
    children: ReactNode
    className?: string
    style: React.CSSProperties
    isSelected: boolean
    isEditMode: boolean
    isHidden: boolean
    isDragging: boolean
    layoutMode: 'flow' | 'canvas'
    sectionId?: string
    onSelect: () => void
    handleResizeStart: (e: React.MouseEvent, direction: string) => void
    setRefs: (node: HTMLDivElement | null) => void
    dragAttributes: any
    dragListeners: any
}

export function BlockFrame({
    block,
    children,
    className,
    style,
    isSelected,
    isEditMode,
    isHidden,
    isDragging,
    layoutMode,
    sectionId,
    onSelect,
    handleResizeStart,
    setRefs,
    dragAttributes,
    dragListeners
}: BlockFrameProps) {
    const isContentBlock = ['heading', 'paragraph', 'button', 'rich-text'].includes(block.type)
    const isCardBlock = block.type === 'card'
    const isIconBlock = block.type === 'icon'
    const isResizable = isContentBlock || isCardBlock || isIconBlock
    const isFooter = block.type === 'footer'

    // Canvas mode: apply drag to whole container (except when editing text)
    // Flow mode: drag via grip handle only
    const containerDragProps = layoutMode === 'canvas' ? { ...dragListeners, ...dragAttributes } : {}

    return (
        <div
            ref={setRefs}
            style={style}
            className={cn(
                "group",
                layoutMode === 'flow' ? "w-full relative" : "absolute",
                isSelected ? "border-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-50" : "hover:border hover:border-blue-500/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]",
                isEditMode && layoutMode === 'canvas' ? "cursor-move" : "",
                isHidden && isEditMode ? "opacity-75 grayscale border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] outline-none ring-2 ring-yellow-500" : "",
                className
            )}
            onClick={(e) => {
                e.stopPropagation()
                onSelect()
            }}
            {...containerDragProps}
        >
            {/* Content wrapper - prevent drag when editing text */}
            <div
                className="w-full h-full"
                onPointerDown={e => {
                    if (layoutMode === 'canvas' && (e.target as HTMLElement).isContentEditable) {
                        e.stopPropagation()
                    }
                }}
            >
                {children}
            </div>

            {/* Toolbars */}
            {isEditMode && <BlockToolbars block={block} isSelected={isSelected} sectionId={sectionId} />}

            {/* Resize Handles */}
            {isEditMode && <BlockResizeHandles onResizeStart={handleResizeStart} isVisible={isSelected && isResizable} />}

            {/* Flow Mode Drag Grip */}
            {layoutMode === 'flow' && isEditMode && !isFooter && (
                <div
                    className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-50 text-zinc-500 hover:text-white"
                    {...dragAttributes}
                    {...dragListeners}
                >
                    <GripVertical className="w-4 h-4" />
                </div>
            )}
        </div>
    )
}
