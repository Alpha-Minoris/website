'use client'

import React from 'react'
import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { BlockRenderer } from './block-renderer'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock } from '@/actions/block-actions'
import { DndContext, pointerWithin, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable, DragStartEvent, DragMoveEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { calculateSnapPoints, applySnapping, SnapGuide } from '@/lib/hooks/use-snapping'
import { AlignmentGuides } from '@/components/editor/alignment-guides'

interface GenericSectionSettings {
    minHeight?: number | string
    padding?: string
    backgroundColor?: string
    gridSnapSize?: number
}

export function GenericSectionBlock({ id, content, settings, slug }: BlockProps) {
    const { isEditMode, updateBlock: updateBlockLocal, blocks, setActiveDragId, selectedBlockId, setSelectedBlockId } = useEditorStore()
    const blockFromStore = blocks.find(b => b.id === id)
    const s = (blockFromStore?.settings || settings) as GenericSectionSettings || {}

    const sectionRef = React.useRef<HTMLDivElement>(null)

    // State for alignment guides during drag
    const [activeGuides, setActiveGuides] = React.useState<SnapGuide[]>([])

    // Parse initial height from settings
    const getInitialHeight = () => {
        const settingsHeight = s.minHeight
        if (settingsHeight) {
            return parseInt(settingsHeight.toString())
        }
        return s.padding ? parseInt(s.padding) : 300
    }

    const [minHeight, setMinHeight] = React.useState(getInitialHeight)
    const heightRef = React.useRef(minHeight)
    const userResizedRef = React.useRef(false)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Helper for finding nested blocks
    const findBlockRecursive = (blocks: any[], targetId: string): any | null => {
        for (const block of blocks) {
            if (block.id === targetId) return block
            if (Array.isArray(block.content)) {
                const found = findBlockRecursive(block.content, targetId)
                if (found) return found
            }
        }
        return null
    }

    // Helper to find parent
    const findParentRecursive = (blocks: any[], targetId: string, parent: any = null): any | null => {
        for (const block of blocks) {
            if (block.id === targetId) return parent
            if (Array.isArray(block.content)) {
                const found = findParentRecursive(block.content, targetId, block)
                if (found) return found
            }
        }
        return null
    }

    // Auto-Resize Logic
    React.useEffect(() => {
        if (!content || !Array.isArray(content)) return
        if (userResizedRef.current) return

        let maxY = 0
        const traverse = (nodes: any[]) => {
            nodes.forEach(node => {
                if (node.settings?.y !== undefined) {
                    const h = parseInt(node.settings.height) || parseInt(node.settings.minHeight) || 100
                    const y = parseInt(node.settings.y) || 0
                    const bottom = y + h
                    if (bottom > maxY) maxY = bottom
                }
                if (Array.isArray(node.content)) {
                    traverse(node.content)
                }
            })
        }
        traverse(content)

        const autoHeight = maxY + 100
        if (autoHeight > heightRef.current) {
            setMinHeight(autoHeight)
            heightRef.current = autoHeight
        }
    }, [content])

    // Sync with persisted settings
    React.useEffect(() => {
        const settingsHeight = s.minHeight ? parseInt(s.minHeight.toString()) : null
        if (settingsHeight && settingsHeight !== heightRef.current && !userResizedRef.current) {
            setMinHeight(settingsHeight)
            heightRef.current = settingsHeight
        }
    }, [s.minHeight])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isEditMode) return
        e.preventDefault()
        e.stopPropagation()

        const startY = e.clientY
        const startHeight = minHeight
        heightRef.current = minHeight
        userResizedRef.current = true

        const onMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientY - startY
            const newHeight = Math.max(100, startHeight + delta)
            setMinHeight(newHeight)
            heightRef.current = newHeight
        }

        const onMouseUp = async () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)

            const finalHeight = heightRef.current

            try {
                await updateBlock(id, { settings: { ...s, minHeight: finalHeight } })
                updateBlockLocal(id, { settings: { ...s, minHeight: finalHeight } })
            } catch (err) {
                console.error("Failed to save section height", err)
            }
        }
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over, delta } = event
        setActiveDragId(null)

        // Always need a valid delta to proceed
        if (!delta) return

        const activeBlock = findBlockRecursive(content, active.id as string)
        if (!activeBlock) return

        const currentX = parseInt(activeBlock.settings?.x) || 0
        const currentY = parseInt(activeBlock.settings?.y) || 0

        let newSettings = { ...(activeBlock.settings as any) }

        const overData = over?.data.current
        const isDropOnContainer = overData?.type === 'container' || overData?.isCard
        const isDropOnSectionCanvas = overData?.type === 'section-canvas'

        // Check current parent
        const currentParent = findParentRecursive(content, active.id as string)

        if (isDropOnContainer && over) {
            // Dropping INTO a container
            const containerId = overData.containerId || overData.cardId
            const containerRect = over.rect
            const isSameParent = currentParent?.id === containerId

            if (containerRect) {
                const activeInitialRect = active.rect.current.initial
                if (activeInitialRect) {
                    const finalLeft = activeInitialRect.left + delta.x
                    const finalTop = activeInitialRect.top + delta.y
                    newSettings.x = Math.max(0, Math.round(finalLeft - containerRect.left))
                    newSettings.y = Math.max(0, Math.round(finalTop - containerRect.top))
                }

                if (!isSameParent) {
                    // Reparent
                    updateBlockLocal(active.id as string, { settings: newSettings })
                    try {
                        const { moveBlock } = await import('@/actions/reorder-blocks')
                        await moveBlock(id, active.id as string, containerId, newSettings)
                    } catch (e) {
                        console.error("Reparenting failed", e)
                    }
                    return
                }
            }
        } else if (isDropOnSectionCanvas || !overData) {
            // Dropping on section canvas - use delta-based positioning
            newSettings.x = Math.max(0, currentX + delta.x)
            newSettings.y = Math.max(0, currentY + delta.y)

            if (currentParent && sectionRef.current) {
                // Un-nest: recalculate absolute position
                const sectionRect = sectionRef.current.getBoundingClientRect()
                const activeInitialRect = active.rect.current.initial
                if (activeInitialRect) {
                    const finalLeft = activeInitialRect.left + delta.x
                    const finalTop = activeInitialRect.top + delta.y
                    newSettings.x = Math.max(0, Math.round(finalLeft - sectionRect.left))
                    newSettings.y = Math.max(0, Math.round(finalTop - sectionRect.top))
                }

                updateBlockLocal(active.id as string, { settings: newSettings })
                try {
                    const { moveBlock } = await import('@/actions/reorder-blocks')
                    await moveBlock(id, active.id as string, id, newSettings)
                } catch (e) {
                    console.error("Un-nesting failed", e)
                }
                return
            }
        }

        // Default: just update position
        updateBlockLocal(active.id as string, { settings: newSettings })
    }

    // Droppable for section canvas
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: `${id}-canvas`,
        data: { type: 'section-canvas', sectionId: id }
    })

    const setCombinedRef = (node: HTMLDivElement | null) => {
        sectionRef.current = node
        setDroppableRef(node)
    }

    return (
        <div
            ref={setCombinedRef}
            className={cn(
                "w-full relative group/section",
                isEditMode ? "border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg" : "border-0 p-0",
                isOver && isEditMode && "border-blue-500/50"
            )}
            style={{
                minHeight: `${minHeight}px`,
                backgroundColor: s.backgroundColor || 'transparent'
            }}
            onClick={(e) => {
                if (isEditMode) {
                    e.stopPropagation()
                    setSelectedBlockId(id)
                }
            }}
        >

            {content.length === 0 && isEditMode && (
                <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-zinc-500 select-none pointer-events-none z-10 opacity-50">
                    <span className="text-lg font-medium">Empty Section</span>
                    <span className="text-xs">Drag components here</span>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="w-full h-full relative">
                    <BlockRenderer blocks={content} sectionId={id} sectionSlug={slug} layoutMode="canvas" />
                </div>
            </DndContext>

            {isEditMode && (
                <div
                    title="Drag to resize section"
                    className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize z-20 hover:bg-white/10 bg-white/5 transition-colors"
                    onMouseDown={handleMouseDown}
                />
            )}
        </div>
    )
}
