'use client'

import React, { ReactNode } from 'react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'
import { FloatingToolbar } from './floating-toolbar'
import { TextToolbar } from './text-toolbar'
import { CardToolbar } from './card-toolbar'
import { IconToolbar } from './icon-toolbar'
import { useSortable } from '@dnd-kit/sortable'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface EditorBlockWrapperProps {
    blockId: string
    blockType: string
    children: ReactNode
    className?: string
    settings?: any
    sectionId?: string
    layoutMode?: 'flow' | 'canvas' // New prop
}

export function EditorBlockWrapper(props: EditorBlockWrapperProps) {
    const { blockId, sectionId, settings, blockType, layoutMode = 'flow' } = props
    const { isEditMode, selectedBlockId, setSelectedBlockId } = useEditorStore()
    const elementRef = React.useRef<HTMLDivElement>(null)

    // Connect Resize Logic
    const { handleResizeStart } = useResizeLogic(blockId, sectionId, settings, elementRef as React.RefObject<HTMLDivElement>, blockType)

    const commonProps = {
        ...props,
        isEditMode,
        isSelected: selectedBlockId === blockId,
        onSelect: () => setSelectedBlockId(blockId),
        handleResizeStart,
        setElementRef: (node: HTMLDivElement | null) => {
            // @ts-ignore
            elementRef.current = node
        }
    }

    if (layoutMode === 'canvas') {
        return <CanvasBlockWrapper {...commonProps} />
    }

    return <FlowBlockWrapper {...commonProps} />
}

// ------------------------------------------------------------------
// Canvas Wrapper (Absolute, Free Move)
// ------------------------------------------------------------------
function CanvasBlockWrapper(props: any) {
    const { blockId, isEditMode, settings, setElementRef } = props

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: blockId,
        disabled: !isEditMode,
        data: {
            settings,
            x: settings?.x || 0,
            y: settings?.y || 0
        }
    })

    const setRefs = (node: HTMLDivElement | null) => {
        setNodeRef(node)
        setElementRef(node)
    }

    // Coordinates: Absolute
    // Style Logic:
    // - x/y from settings (or 0)
    // - width/height ONLY if set (resized). Else auto/content.
    // - NO transition during drag.
    const style: React.CSSProperties = {
        position: 'absolute',
        left: settings?.x || 0,
        top: settings?.y || 0,
        width: settings?.width,
        height: settings?.height,
        transition: 'none',
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        zIndex: isDragging ? 1000 : (settings?.zIndex || 'auto'),
        opacity: isDragging ? 0.8 : 1,
    }

    // Preview Mode (Clean render)
    if (!isEditMode) {
        return (
            <div style={{ ...style, transition: 'none', border: 'none', cursor: 'default' }}>
                {props.children}
            </div>
        )
    }

    return (
        <BlockFrame
            {...props}
            setRefs={setRefs}
            style={style}
            listeners={listeners}
            attributes={attributes}
            isDragging={isDragging}
        />
    )
}

// ------------------------------------------------------------------
// Flow Wrapper (Relative, List Sortable)
// ------------------------------------------------------------------
function FlowBlockWrapper(props: any) {
    const { blockId, isEditMode, settings, setElementRef, blockType } = props

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: blockId,
        disabled: !isEditMode
    })

    const setRefs = (node: HTMLDivElement | null) => {
        setNodeRef(node)
        setElementRef(node)
    }

    const style: React.CSSProperties = {
        position: 'relative',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
        width: blockType === 'icon' ? settings?.width : undefined,
        height: blockType === 'icon' ? settings?.height : undefined,
        minHeight: blockType !== 'icon' ? settings?.minHeight : undefined,
    }

    if (!isEditMode) {
        return <div className={props.className} style={style}>{props.children}</div>
    }

    return (
        <BlockFrame
            {...props}
            setRefs={setRefs}
            style={style}
            listeners={listeners}
            attributes={attributes} // Handle passed to Grip logic if needed, or whole block
            isDragging={isDragging}
        />
    )
}

// ------------------------------------------------------------------
// Shared UI Frame
// ------------------------------------------------------------------
function BlockFrame({
    setRefs, style, className, isSelected, isEditMode, onSelect,
    listeners, attributes, blockId, blockType, sectionId, settings,
    handleResizeStart, children, layoutMode
}: any) {
    const isContentBlock = ['heading', 'paragraph', 'button', 'rich-text'].includes(blockType)
    const isCardBlock = blockType === 'card'
    const isIconBlock = blockType === 'icon'
    const isResizable = isContentBlock || isCardBlock || isIconBlock

    // Drag Props:
    // Canvas: Apply to CONTAINER (whole block drags). Exception: Text editing.
    // Flow: Apply to Grip (handled later). for now passing empty for flow.
    const dragProps = layoutMode === 'canvas' ? { ...listeners, ...attributes } : {}

    return (
        <div
            ref={setRefs}
            style={style}
            // Sizing Logic:
            // Flow: w-full relative (standard block behavior)
            // Canvas: absolute (implied w-auto). NO FORCED WIDTH.
            className={cn(
                "group outline-none",
                layoutMode === 'flow' ? "w-full relative" : "absolute",
                isSelected ? "ring-2 ring-blue-500 z-10" : "hover:ring-1 hover:ring-blue-500/50",
                isEditMode && layoutMode === 'canvas' ? "cursor-move" : "",
                className
            )}
            onClick={(e) => {
                e.stopPropagation()
                onSelect()
            }}
            {...dragProps}
        >
            {/* Text Editing Protection: Stop propagation on content clicks in Canvas */}
            <div className="w-full h-full" onPointerDown={e => {
                if (layoutMode === 'canvas' && (e.target as HTMLElement).isContentEditable) {
                    e.stopPropagation() // Allow text selection, ignore drag
                }
            }}>
                {children}
            </div>

            {isSelected && (
                <>
                    {/* Toolbars */}
                    {!isContentBlock && !isCardBlock && blockType !== 'icon' &&
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-2 z-50 cursor-default" onPointerDown={e => e.stopPropagation()}>
                            <FloatingToolbar id={blockId} />
                        </div>
                    }

                    {isContentBlock &&
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 cursor-default" onPointerDown={e => e.stopPropagation()}>
                            <TextToolbar blockId={blockId} />
                        </div>
                    }

                    {isCardBlock && sectionId &&
                        <CardToolbar blockId={blockId} sectionId={sectionId} settings={settings} />
                    }

                    {blockType === 'icon' &&
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 cursor-default" onPointerDown={e => e.stopPropagation()}>
                            <IconToolbar settings={settings} onUpdate={(u: any) => useEditorStore.getState().updateBlock(blockId, { settings: { ...settings, ...u } })} onDelete={() => { }} />
                        </div>
                    }
                </>
            )}

            {/* Resize Handles */}
            {isEditMode && isSelected && isResizable && (
                <>
                    {['nw', 'ne', 'se', 'sw'].map((dir) => (
                        <div
                            key={dir}
                            className={cn(
                                "absolute w-2.5 h-2.5 bg-white border border-blue-500 rounded-full z-[70] opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100",
                                dir === 'nw' && "-top-1.5 -left-1.5 cursor-nw-resize",
                                dir === 'ne' && "-top-1.5 -right-1.5 cursor-ne-resize",
                                dir === 'se' && "-bottom-1.5 -right-1.5 cursor-se-resize",
                                dir === 'sw' && "-bottom-1.5 -left-1.5 cursor-sw-resize"
                            )}
                            onMouseDown={(e) => handleResizeStart(e, dir)}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                    ))}
                    {['n', 'e', 's', 'w'].map((dir) => (
                        <div
                            key={dir}
                            className={cn(
                                "absolute bg-transparent z-[65]",
                                // Hit areas
                                dir === 'n' && "-top-1 left-0 right-0 h-2 cursor-n-resize",
                                dir === 'e' && "top-0 -right-1 bottom-0 w-2 cursor-e-resize",
                                dir === 's' && "-bottom-1 left-0 right-0 h-2 cursor-s-resize",
                                dir === 'w' && "top-0 -left-1 bottom-0 w-2 cursor-w-resize"
                            )}
                            onMouseDown={(e) => handleResizeStart(e, dir)}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                    ))}
                </>
            )}

            {/* Flow Mode Grip */}
            {layoutMode === 'flow' && isEditMode && (
                <div
                    className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-50 text-zinc-500 hover:text-white"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-4 h-4" />
                </div>
            )}
        </div>
    )
}

// Update useResizeLogic signature and logic - Google Slides-style directional resize
function useResizeLogic(blockId: string, sectionId: string | undefined, settings: any, nodeRef: React.RefObject<HTMLDivElement>, blockType?: string) {
    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.preventDefault()
        e.stopPropagation()

        if (!nodeRef.current) return

        const startMouseX = e.clientX
        const startMouseY = e.clientY
        const startRect = nodeRef.current.getBoundingClientRect()
        const startW = startRect.width
        const startH = startRect.height

        // Track starting position for directional resize
        const startX = parseInt(settings?.x) || 0
        const startY = parseInt(settings?.y) || 0

        // Track position changes during drag
        let currentX = startX
        let currentY = startY

        const doDrag = (ev: MouseEvent) => {
            if (!nodeRef.current) return

            const dx = ev.clientX - startMouseX
            const dy = ev.clientY - startMouseY

            let newW = startW
            let newH = startH
            let newX = startX
            let newY = startY

            // East: expand width to the right (position stays same)
            if (direction.includes('e')) {
                newW = startW + dx
            }

            // West: expand width to the left (position moves left)
            if (direction.includes('w')) {
                newW = startW - dx
                newX = startX + dx // Move position left as we expand
            }

            // South: expand height downward (position stays same)
            if (direction.includes('s')) {
                newH = startH + dy
            }

            // North: expand height upward (position moves up)
            if (direction.includes('n')) {
                newH = startH - dy
                newY = startY + dy // Move position up as we expand
            }

            // Enforce minimum sizes
            const minSize = 20
            if (newW < minSize) {
                newW = minSize
                if (direction.includes('w')) {
                    newX = startX + startW - minSize
                }
            }
            if (newH < minSize) {
                newH = minSize
                if (direction.includes('n')) {
                    newY = startY + startH - minSize
                }
            }

            // Store current position for saving
            currentX = newX
            currentY = newY

            // Apply directly to DOM - no transitions, instant response
            nodeRef.current.style.transition = 'none'
            nodeRef.current.style.width = `${newW}px`

            // Update position for directional resize
            if (direction.includes('w') || direction.includes('n')) {
                nodeRef.current.style.left = `${newX}px`
                nodeRef.current.style.top = `${newY}px`
            }

            if (direction.includes('s') || direction.includes('n')) {
                if (blockType === 'icon') {
                    nodeRef.current.style.height = `${newH}px`
                    nodeRef.current.style.minHeight = 'unset'
                } else {
                    nodeRef.current.style.minHeight = `${newH}px`
                }
            }
        }

        const stopDrag = async () => {
            window.removeEventListener('mousemove', doDrag)
            window.removeEventListener('mouseup', stopDrag)

            if (sectionId && nodeRef.current) {
                // Dynamic import to avoid cycles
                const { updateBlockContent } = await import('@/actions/block-actions')

                const newSettings: Record<string, any> = {
                    ...settings,
                    width: nodeRef.current.style.width,
                    x: currentX,
                    y: currentY,
                }

                if (blockType === 'icon') {
                    newSettings.height = nodeRef.current.style.height
                    delete newSettings.minHeight
                } else {
                    newSettings.minHeight = nodeRef.current.style.minHeight
                }

                await updateBlockContent(sectionId, blockId, {
                    settings: newSettings
                })

                // Also update local store immediately
                useEditorStore.getState().updateBlock(blockId, { settings: newSettings })
            }
        }

        window.addEventListener('mousemove', doDrag)
        window.addEventListener('mouseup', stopDrag)
    }

    return { handleResizeStart }
}
