import { useSortable } from '@dnd-kit/sortable'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { BlockProps } from '@/components/blocks/types'

interface UseBlockDragProps {
    blockId: string
    block: BlockProps
    layoutMode: 'flow' | 'canvas'
    isEditMode: boolean
}

interface DragResult {
    attributes: any
    listeners: any
    setNodeRef: (node: HTMLElement | null) => void
    transform: any
    transition?: string
    isDragging: boolean
    style: React.CSSProperties
}

export function useBlockDrag({ blockId, block, layoutMode, isEditMode }: UseBlockDragProps): DragResult {
    if (layoutMode === 'canvas') {
        // Canvas: Free absolute positioning with useDraggable
        const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
            id: blockId,
            disabled: !isEditMode,
            data: {
                ...block,
                x: block.x || 0,
                y: block.y || 0
            }
        })

        const style: React.CSSProperties = {
            position: 'absolute',
            left: block.x || 0,
            top: block.y || 0,
            width: block.width,
            height: block.height,
            transition: 'none',
            transform: transform ? CSS.Translate.toString(transform) : undefined,
            zIndex: isDragging ? 1000 : (block.zIndex || 'auto'),
            opacity: isDragging ? 0.8 : 1,
        }

        return { attributes, listeners, setNodeRef, transform, isDragging, style }
    }

    // Flow: Vertical list sorting with useSortable
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: blockId,
        disabled: !isEditMode
    })

    const style: React.CSSProperties = {
        position: 'relative',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    }

    return { attributes, listeners, setNodeRef, transform, transition, isDragging, style }
}
