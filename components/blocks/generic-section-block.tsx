
import React from 'react'
import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { BlockRenderer } from './block-renderer'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock } from '@/actions/block-actions'
import { FloatingToolbar } from '@/components/editor/floating-toolbar'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { moveBlock } from '@/actions/reorder-blocks'

interface GenericSectionSettings {
    justify?: 'start' | 'center' | 'end'
    align?: 'start' | 'center' | 'end'
    direction?: 'row' | 'column'
    padding?: string
    minHeight?: number | string
}

export function GenericSectionBlock({ id, content, settings }: BlockProps) {
    const { isEditMode, selectedBlockId } = useEditorStore()
    const s = settings as GenericSectionSettings || {}
    const justify = s.justify || 'center'
    const align = s.align || 'center'
    const direction = s.direction || 'column'

    // Default to 300px min-height if not set
    // Parse it safely in case it's stored as string "300"
    const initialHeight = s.minHeight
        ? parseInt(s.minHeight.toString())
        : (s.padding ? parseInt(s.padding) : 300)

    const [minHeight, setMinHeight] = React.useState(initialHeight)

    // Ref to track height during drag without stale closures
    const heightRef = React.useRef(minHeight)

    // Sync state if props change externally (e.g. undo/redo)
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
            const newHeight = Math.max(100, startHeight + delta) // Min 100px
            setMinHeight(newHeight)
            heightRef.current = newHeight
        }

        const onMouseUp = async () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)

            // Persist final height
            try {
                // Ensure we spread existing settings so we don't lose direction/align
                await updateBlock(id, { settings: { ...s, minHeight: heightRef.current } })
            } catch (err) {
                console.error("Failed to save section height", err)
            }
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    const hasContent = Array.isArray(content) && content.length > 0

    // Toolbar - Only show if THIS section is selected
    const showToolbar = isEditMode && selectedBlockId === id

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            try {
                // Use Deep Reorder Action
                // id passed here is Section ID (top level block)
                await moveBlock(id, active.id as string, over?.id as string)
            } catch (err) {
                console.error("Failed to move block", err)
            }
        }
    }

    return (
        <div
            className={cn(
                "w-full flex gap-4 transition-all relative group/section",
                // Visuals: Only show border/padding in Edit Mode
                isEditMode ? "border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg p-8" : "border-0 p-0",
                {
                    'justify-start': justify === 'start',
                    'justify-center': justify === 'center',
                    'justify-end': justify === 'end',
                    'items-start': align === 'start',
                    'items-center': align === 'center',
                    'items-end': align === 'end',
                    'flex-row': direction === 'row',
                    'flex-col': direction === 'column',
                }
            )}
            style={{ minHeight: `${minHeight}px` }}
        >


            {/* Empty State / Canvas Placeholder (Edit Mode Only) */}
            {!hasContent && isEditMode ? (
                <div className="flex flex-col items-center justify-center w-full h-full text-zinc-500 select-none pointer-events-none z-10 transition-opacity opacity-50 hover:opacity-100">
                    <span className="text-lg font-medium">New Section</span>
                    <span className="text-xs">Canvas Area</span>
                </div>
            ) : null}

            {/* Actual Content */}
            {hasContent && (
                <div className="w-full h-full relative z-10">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <BlockRenderer blocks={content} sectionId={id} />
                    </DndContext>
                </div>
            )}

            {/* Drop Target Helper (Edit Mode Only, Empty) */}
            {!hasContent && isEditMode && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <Plus className="w-24 h-24" />
                </div>
            )}

            {/* Resize Handle - Only in Edit Mode */}
            {isEditMode && (
                <div
                    title="Drag to resize height"
                    className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize flex items-end justify-center group/handle z-20 hover:bg-white/5 transition-colors"
                    onMouseDown={handleMouseDown}
                >
                    <div className="w-16 h-1 bg-zinc-700/30 rounded-full group-hover/handle:bg-emerald-500 transition-colors mb-1.5 shadow-sm" />
                </div>
            )}
        </div>
    )
}
