import React from 'react'
import { BlockProps } from '@/components/blocks/types'
import { useEditorStore } from '@/lib/stores/editor-store'

interface UseBlockResizeProps {
    blockId: string
    sectionId: string | undefined
    block: BlockProps
    nodeRef: React.RefObject<HTMLDivElement | null>
    blockType?: string
}

export function useBlockResize({ blockId, sectionId, block, nodeRef, blockType }: UseBlockResizeProps) {
    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.preventDefault()
        e.stopPropagation()

        if (!nodeRef.current) return

        const startMouseX = e.clientX
        const startMouseY = e.clientY
        const startRect = nodeRef.current.getBoundingClientRect()
        const startW = startRect.width
        const startH = startRect.height

        // Calculate aspect ratio for shift+resize
        const aspectRatio = startW / startH

        // Track starting position for directional resize
        const startX = parseInt(String(block.x)) || 0
        const startY = parseInt(String(block.y)) || 0

        // Track position changes during drag
        let currentX = startX
        let currentY = startY

        const doDrag = (ev: MouseEvent) => {
            if (!nodeRef.current) return

            const dx = ev.clientX - startMouseX
            const dy = ev.clientY - startMouseY
            const shiftHeld = ev.shiftKey

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
                newX = startX + dx
            }

            // South: expand height downward (position stays same)
            if (direction.includes('s')) {
                newH = startH + dy
            }

            // North: expand height upward (position moves up)
            if (direction.includes('n')) {
                newH = startH - dy
                newY = startY + dy
            }

            // Shift+Resize: Lock aspect ratio (only for corner resizes)
            const isCorner = direction.length === 2
            if (shiftHeld && isCorner) {
                const currentAspect = newW / newH
                if (currentAspect > aspectRatio) {
                    newW = newH * aspectRatio
                    if (direction.includes('w')) {
                        newX = startX + (startW - newW)
                    }
                } else {
                    newH = newW / aspectRatio
                    if (direction.includes('n')) {
                        newY = startY + (startH - newH)
                    }
                }
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

            currentX = newX
            currentY = newY

            // Apply directly to DOM
            nodeRef.current.style.transition = 'none'
            nodeRef.current.style.width = `${newW}px`

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
                const { updateBlockContent } = await import('@/actions/block-actions')

                const newBlock: Record<string, any> = {
                    ...block,
                    width: nodeRef.current.style.width,
                    x: currentX,
                    y: currentY,
                }

                if (blockType === 'icon') {
                    newBlock.height = nodeRef.current.style.height
                    delete newBlock.minHeight
                } else {
                    newBlock.minHeight = nodeRef.current.style.minHeight
                }

                await updateBlockContent(sectionId, blockId, newBlock)
                useEditorStore.getState().updateBlock(blockId, newBlock)
            }
        }

        window.addEventListener('mousemove', doDrag)
        window.addEventListener('mouseup', stopDrag)
    }

    return { handleResizeStart }
}
