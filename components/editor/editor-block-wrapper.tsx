'use client'

import React, { ReactNode } from 'react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'
import { FloatingToolbar } from './floating-toolbar'
import { TextToolbar } from './text-toolbar'
import { CardToolbar } from './card-toolbar'
import { IconToolbar } from './icon-toolbar'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface EditorBlockWrapperProps {
    blockId: string
    blockType: string
    children: ReactNode
    className?: string
    settings?: any
    sectionId?: string
}

export function EditorBlockWrapper({ blockId, blockType, children, className, settings, sectionId }: EditorBlockWrapperProps) {
    const { isEditMode, selectedBlockId, setSelectedBlockId } = useEditorStore()

    // Internal ref for resizing calculations
    const elementRef = React.useRef<HTMLDivElement>(null)

    // Connect Resize Logic
    const { handleResizeStart } = useResizeLogic(blockId, sectionId, settings, elementRef as React.RefObject<HTMLDivElement>, blockType)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: blockId, disabled: !isEditMode })

    // Merge refs
    const setRefs = (node: HTMLDivElement | null) => {
        setNodeRef(node)
        // @ts-ignore
        elementRef.current = node
    }

    // ...

    {/* Only show Icon Toolbar for icon blocks */ }
    {
        blockType === 'icon' &&
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                <IconToolbar settings={settings} onUpdate={(u: any) => {
                    // We need to use updateBlock from store
                    useEditorStore.getState().updateBlock(blockId, { settings: { ...settings, ...u } })
                    // And trigger server update (debounced ideally, but direct for now is ok for icons)
                    if (sectionId) {
                        import('@/actions/block-actions').then(({ updateBlockContent }) => {
                            updateBlockContent(sectionId, blockId, { settings: { ...settings, ...u } })
                        })
                    }
                }}
                    onDelete={async () => {
                        const { deleteChildBlock } = await import('@/actions/block-actions')
                        if (sectionId) {
                            await deleteChildBlock(sectionId, blockId)
                        }
                    }}
                />
            </div>
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
        position: 'relative' as const,
        width: blockType === 'icon' ? settings?.width : undefined,
        height: blockType === 'icon' ? settings?.height : undefined,
        minHeight: blockType !== 'icon' ? settings?.minHeight : undefined,
    }

    if (!isEditMode) {
        return <div className={className} style={{
            width: blockType === 'icon' ? settings?.width : undefined,
            height: blockType === 'icon' ? settings?.height : undefined,
            minHeight: blockType !== 'icon' ? settings?.minHeight : undefined,
        }}>{children}</div>
    }

    const isSelected = selectedBlockId === blockId

    const isContentBlock = ['heading', 'paragraph', 'button', 'rich-text'].includes(blockType)
    const isCardBlock = blockType === 'card'
    const isIconBlock = blockType === 'icon'

    // Only allow resizing for specific blocks. Sections (full width) should not use these handles.
    const isResizable = isContentBlock || isCardBlock || isIconBlock

    return (
        <div
            ref={setRefs}
            style={style}
            className={cn(
                "relative transition-all duration-200 group rounded-md",
                // Highlight Logic: Subtle gradient accent
                isSelected
                    ? "shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] ring-1 ring-blue-500/20 z-10"
                    : "hover:ring-1 hover:ring-blue-500/10",
                // Size Logic: Fit content, but allow full width if the block naturally wants it.
                // We use inline-flex or w-fit to wrap tightly.
                "w-fit max-w-full",
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
                    {!isContentBlock && !isCardBlock && blockType !== 'icon' &&
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

                    {/* Only show Card Toolbar for card blocks */}
                    {isCardBlock && sectionId &&
                        <CardToolbar blockId={blockId} sectionId={sectionId} settings={settings} />
                    }

                    {/* Only show Icon Toolbar for icon blocks */}
                    {blockType === 'icon' &&
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                            <IconToolbar settings={settings} onUpdate={(u) => {
                                // We need to use updateBlock from store
                                useEditorStore.getState().updateBlock(blockId, { settings: { ...settings, ...u } })
                                // And trigger server update (debounced ideally, but direct for now is ok for icons)
                                if (sectionId) {
                                    import('@/actions/block-actions').then(({ updateBlockContent }) => {
                                        updateBlockContent(sectionId, blockId, { settings: { ...settings, ...u } })
                                    })
                                }
                            }}
                                onDelete={async () => {
                                    const { deleteChildBlock } = await import('@/actions/block-actions')
                                    if (sectionId) {
                                        await deleteChildBlock(sectionId, blockId)
                                    }
                                }}
                            />
                        </div>
                    }
                </>
            )}

            {/* Drag Handle (Visible on Hover or Select) */}
            {
                isEditMode && (
                    <div
                        className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-50 text-zinc-500 hover:text-white"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                )
            }

            {/* Global Resize Handles (8-Point) - Only for Resizable Content Blocks, NOT Sections */}
            {
                isEditMode && isSelected && isResizable && (
                    <>
                        {/* Corners */}
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
                            />
                        ))}
                        {/* Sides */}
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
                            />
                        ))}
                    </>
                )
            }

            {children}
        </div >
    )
}

// Update useResizeLogic signature and logic
function useResizeLogic(blockId: string, sectionId: string | undefined, settings: any, nodeRef: React.RefObject<HTMLDivElement>, blockType?: string) {
    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.preventDefault()
        e.stopPropagation()

        if (!nodeRef.current) return

        const startX = e.clientX
        const startY = e.clientY
        const startRect = nodeRef.current.getBoundingClientRect()
        const startW = startRect.width
        const startH = startRect.height

        const doDrag = (ev: MouseEvent) => {
            if (!nodeRef.current) return

            const dx = ev.clientX - startX
            const dy = ev.clientY - startY

            let newW = startW
            let newH = startH

            if (direction.includes('e')) newW = startW + dx
            if (direction.includes('w')) newW = startW - dx

            if (direction.includes('s')) newH = startH + dy
            if (direction.includes('n')) newH = startH - dy

            // Apply directly to DOM
            if (direction.includes('e') || direction.includes('w')) {
                nodeRef.current.style.width = `${Math.max(20, newW)}px`
            }

            if (direction.includes('s') || direction.includes('n')) {
                const h = Math.max(20, newH)
                if (blockType === 'icon') {
                    nodeRef.current.style.height = `${h}px`
                    nodeRef.current.style.minHeight = 'unset'
                } else {
                    nodeRef.current.style.minHeight = `${h}px`
                }
            }
        }

        const stopDrag = async () => {
            window.removeEventListener('mousemove', doDrag)
            window.removeEventListener('mouseup', stopDrag)

            if (sectionId && nodeRef.current) {
                // Dynamic import to avoid cycles
                const { updateBlockContent } = await import('@/actions/block-actions')

                const newSettings = {
                    ...settings,
                    width: nodeRef.current.style.width,
                }

                if (blockType === 'icon') {
                    newSettings.height = nodeRef.current.style.height
                    // Ensure we don't save minHeight if we switched to strict height
                    delete newSettings.minHeight
                } else {
                    newSettings.minHeight = nodeRef.current.style.minHeight
                }

                await updateBlockContent(sectionId, blockId, {
                    settings: newSettings
                })

                // Also update local store immediately to reflect change in UI if needed
                useEditorStore.getState().updateBlock(blockId, { settings: newSettings })
            }
        }

        window.addEventListener('mousemove', doDrag)
        window.addEventListener('mouseup', stopDrag)
    }

    return { handleResizeStart }
}

