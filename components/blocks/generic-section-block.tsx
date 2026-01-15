
import React from 'react'
import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { BlockRenderer } from './block-renderer'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock } from '@/actions/block-actions'
import { FloatingToolbar } from '@/components/editor/floating-toolbar'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { moveBlock } from '@/actions/reorder-blocks'

interface GenericSectionSettings {
    rows?: number
    cols?: number
    minHeight?: number | string
    padding?: string
}

export function GenericSectionBlock({ id, content, settings }: BlockProps) {
    const { isEditMode, selectedBlockId, updateBlock: updateBlockLocal, blocks } = useEditorStore()
    const blockFromStore = blocks.find(b => b.id === id)
    const s = (blockFromStore?.settings || settings) as GenericSectionSettings || {}

    const rows = s.rows || 1
    const cols = s.cols || 1

    const initialHeight = s.minHeight
        ? parseInt(s.minHeight.toString())
        : (s.padding ? parseInt(s.padding) : 300)

    const [minHeight, setMinHeight] = React.useState(initialHeight)
    const heightRef = React.useRef(minHeight)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Helper for finding nested blocks
    const findBlockRecursive = (blocks: any[], id: string): any | null => {
        for (const block of blocks) {
            if (block.id === id) return block
            if (Array.isArray(block.content)) {
                const found = findBlockRecursive(block.content, id)
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
        if (!content) return

        let maxY = 0
        const traverse = (nodes: any[]) => {
            nodes.forEach(node => {
                if (node.settings?.y !== undefined) {
                    const h = parseInt(node.settings.height) || 100
                    const y = parseInt(node.settings.y) || 0
                    const bottom = y + h
                    if (bottom > maxY) maxY = bottom
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


    React.useEffect(() => {
        setMinHeight(initialHeight)
        heightRef.current = initialHeight
    }, [initialHeight])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isEditMode) return
        e.preventDefault()
        const startY = e.clientY
        const startHeight = minHeight
        heightRef.current = minHeight

        const onMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientY - startY
            const newHeight = Math.max(100, startHeight + delta)
            setMinHeight(newHeight)
            heightRef.current = newHeight
        }

        const onMouseUp = async () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            try {
                await updateBlock(id, { settings: { ...s, minHeight: heightRef.current } })
            } catch (err) {
                console.error("Failed to save section height", err)
            }
        }
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over, delta } = event

        if (!over) return

        const activeBlock = findBlockRecursive(content, active.id as string)
        if (!activeBlock) return

        let newSettings = { ...(activeBlock.settings as any) }
        let hasChanges = false

        // Determine Final Visual Rect (Universal Truth)
        const finalRect = active.rect.current.translated || {
            left: (active.rect.current.initial?.left || 0) + delta.x,
            top: (active.rect.current.initial?.top || 0) + delta.y
        }

        // CASE A: Dropping into a Cell (GenericSection Grid) -> Top Level
        if (over.id.toString().includes('cell-')) {
            const targetCellId = over.data.current?.cellId
            if (!targetCellId) return

            // STRICT RECT SUBTRACTION
            if (over.rect) {
                const cellRect = over.rect
                newSettings.x = Math.round(finalRect.left - cellRect.left)
                newSettings.y = Math.round(finalRect.top - cellRect.top)
                newSettings.cellId = targetCellId
                hasChanges = true
            }

            // Un-Nesting Trigger (If coming from a Container)
            const curParent = findParentRecursive(content, active.id as string)
            if (curParent) {
                updateBlockLocal(active.id as string, { settings: newSettings })
                try {
                    const { moveBlock: reorderBlock } = await import('@/actions/reorder-blocks')
                    await reorderBlock(id, active.id as string, over.id as string, newSettings)
                    return
                } catch (e) {
                    console.error("Un-nesting failed", e)
                }
            }
        }
        // CASE B: Dropping into a Container (Reparenting or Moving Inside)
        else if (over.data.current?.type === 'container' || over.data.current?.isCard) {
            const containerId = over.data.current.containerId || over.data.current.cardId
            const currentParent = findParentRecursive(content, active.id as string)
            const isSameParent = currentParent?.id === containerId

            if (over.rect) {
                const containerRect = over.rect

                // STRICT RECT SUBTRACTION
                newSettings.x = Math.round(finalRect.left - containerRect.left)
                newSettings.y = Math.round(finalRect.top - containerRect.top)
                hasChanges = true

                // Optimistic Update
                updateBlockLocal(active.id as string, { settings: newSettings })

                if (isSameParent) {
                    // Optimized Path: Just Update Settings (No structure change)
                } else {
                    // Reparenting Path: Structure Change (Heavy)
                    try {
                        const { moveBlock: reorderBlock } = await import('@/actions/reorder-blocks')
                        await reorderBlock(id, active.id as string, containerId, newSettings)
                        return
                    } catch (e) {
                        console.error("Reparenting/Move failed", e)
                    }
                }
            }
        }

        if (hasChanges) {
            updateBlockLocal(active.id as string, { settings: newSettings })

            try {
                const { updateBlockContent } = await import('@/actions/block-actions')
                await updateBlockContent(id, active.id as string, { settings: newSettings })
            } catch (e) {
                console.error("Failed to update block position", e)
            }
        }
    }

    // Cells
    const cells = []
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            cells.push(`${r}-${c}`)
        }
    }

    return (
        <div
            className={cn(
                "w-full relative group/section transition-all",
                isEditMode ? "border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg p-8" : "border-0 p-0"
            )}
            style={{ minHeight: `${minHeight}px` }}
        >
            {content.length === 0 && isEditMode && (
                <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full text-zinc-500 select-none pointer-events-none z-10 opacity-50">
                    <span className="text-lg font-medium">New Grid Section</span>
                    <span className="text-xs">Drag corners to resize or add content</span>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div
                    className="grid w-full h-full gap-4 relative z-10"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${rows}, minmax(100px, 1fr))`,
                        minHeight: '100%'
                    }}
                >
                    {cells.map(cellId => (
                        <Cell
                            key={cellId}
                            cellId={cellId}
                            sectionId={id}
                            content={content}
                            isEditMode={isEditMode}
                        />
                    ))}
                </div>
            </DndContext>

            {isEditMode && (
                <div title="Drag height" className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize z-20 hover:bg-white/5" onMouseDown={handleMouseDown} />
            )}
        </div>
    )
}

function Cell({ cellId, sectionId, content, isEditMode }: any) {
    const { setNodeRef } = useDroppable({
        id: `${sectionId}-cell-${cellId}`,
        data: { cellId }
    })

    const cellContent = content.filter((block: BlockProps) => {
        const bCell = block.settings?.cellId || '0-0'
        return bCell === cellId
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "relative w-full h-full min-h-[50px] transition-colors",
                isEditMode && "border border-dashed border-zinc-700/30 rounded-md hover:bg-white/5"
            )}
        >
            <BlockRenderer blocks={cellContent} sectionId={sectionId} layoutMode="canvas" />
        </div>
    )
}
