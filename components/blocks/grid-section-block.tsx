
import React, { useState, useRef } from 'react'
import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { BlockRenderer } from './block-renderer'
import { useEditorStore } from '@/lib/stores/editor-store'
import { DndContext, useDroppable, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core'
import { updateBlock } from '@/actions/block-actions'

// Standard 12-column Grid
const GRID_COLS = 12

interface GridBlockSettings {
    colStart?: number
    colSpan?: number
    rowStart?: number
    rowSpan?: number
    minHeight?: number
}

interface GridSectionSettings {
    gap?: number
    minHeight?: number
}

export function GridSectionBlock({ id, content, settings, slug }: BlockProps) {
    const { isEditMode, selectedBlockId, updateBlock: localUpdate } = useEditorStore()
    const containerRef = useRef<HTMLDivElement>(null)

    const s = settings as GridSectionSettings || {}
    const gap = s.gap || 16
    const minHeight = s.minHeight || 300

    // Grid Style
    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridAutoRows: 'minmax(50px, auto)', // Auto rows with min height
        gap: `${gap}px`,
        minHeight: `${minHeight}px`,
        width: '100%',
        position: 'relative'
    }

    // Drag Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    )

    const [activeId, setActiveId] = useState<string | null>(null)
    const [dragPlaceholder, setDragPlaceholder] = useState<React.CSSProperties | null>(null)


    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        setDragPlaceholder(null)

        if (!over) return

        // Dropped on the Grid Container
        if (over.id === id || over.id === `${id}-droppable`) {
            // Calculate Drop Position (Column/Row) logic here
            // For now, just logging content
            console.log("Dropped on Grid", active.id)
        }
    }

    // Calculate Grid Cell from Mouse Position (Placeholder for Logic)
    const handleDragMove = (event: any) => {
        // Todo: Map clientX/Y to Column/Row
    }

    const { setNodeRef } = useDroppable({
        id: `${id}-droppable`,
        data: { type: 'grid-section', sectionId: id }
    })


    return (
        <div
            className={cn(
                "w-full transition-all duration-200",
                isEditMode && "border border-dashed border-zinc-800 p-4 rounded-xl hover:border-zinc-700"
            )}
        >
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
            >
                <div
                    ref={(node) => {
                        containerRef.current = node
                        setNodeRef(node)
                    }}
                    style={gridStyle}
                    className="group/grid"
                >
                    {/* Render Blocks */}
                    {content.map((block: BlockProps) => {
                        const bs = block.settings as GridBlockSettings || {}
                        const style: React.CSSProperties = {
                            gridColumn: `${bs.colStart || 'auto'} / span ${bs.colSpan || 12}`,
                            gridRow: `${bs.rowStart || 'auto'} / span ${bs.rowSpan || 1}`,
                            position: 'relative'
                        }

                        // If being dragged, hide original? Or opacity?
                        const isDragging = activeId === block.id

                        return (
                            <div key={block.id} style={style} className={cn("min-h-[50px] relative", isDragging && "opacity-50")}>
                                <BlockRenderer blocks={[block]} sectionId={id} sectionSlug={slug} layoutMode="canvas" /> {/* Canvas mode removes internal wrappers */}

                                {isEditMode && (
                                    <div className="absolute inset-0 ring-1 ring-blue-500/0 hover:ring-blue-500/50 transition-all pointer-events-none rounded" />
                                )}
                            </div>
                        )
                    })}

                    {/* Placeholder for Edit Mode Empty State */}
                    {content.length === 0 && isEditMode && (
                        <div
                            style={{ gridColumn: '1 / -1', gridRow: '1 / span 3' }}
                            className="flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50 rounded-lg border-2 border-dashed border-zinc-800"
                        >
                            <span>Empty Grid Section</span>
                            <span className="text-xs mt-1">Measurements: 12 Columns</span>
                        </div>
                    )}

                    {/* Drag Placeholder Ghost */}
                    {dragPlaceholder && (
                        <div
                            style={{ ...dragPlaceholder, background: 'rgba(59, 130, 246, 0.2)', border: '1px dashed #3b82f6', zIndex: 50, pointerEvents: 'none' }}
                            className="rounded"
                        />
                    )}
                </div>
            </DndContext>
        </div>
    )
}
