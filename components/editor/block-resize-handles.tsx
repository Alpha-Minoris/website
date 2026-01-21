'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface BlockResizeHandlesProps {
    onResizeStart: (e: React.MouseEvent, direction: string) => void
    isVisible: boolean
}

export function BlockResizeHandles({ onResizeStart, isVisible }: BlockResizeHandlesProps) {
    if (!isVisible) return null

    return (
        <>
            {/* Corner Handles */}
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
                    onMouseDown={(e) => onResizeStart(e, dir)}
                    onPointerDown={(e) => e.stopPropagation()}
                />
            ))}

            {/* Edge Handles */}
            {['n', 'e', 's', 'w'].map((dir) => (
                <div
                    key={dir}
                    className={cn(
                        "absolute bg-transparent z-[65]",
                        dir === 'n' && "-top-1 left-0 right-0 h-2 cursor-n-resize",
                        dir === 'e' && "top-0 -right-1 bottom-0 w-2 cursor-e-resize",
                        dir === 's' && "-bottom-1 left-0 right-0 h-2 cursor-s-resize",
                        dir === 'w' && "top-0 -left-1 bottom-0 w-2 cursor-w-resize"
                    )}
                    onMouseDown={(e) => onResizeStart(e, dir)}
                    onPointerDown={(e) => e.stopPropagation()}
                />
            ))}
        </>
    )
}
