'use client'

import { ReactNode } from 'react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'
import { FloatingToolbar } from './floating-toolbar'

interface EditorBlockWrapperProps {
    blockId: string
    children: ReactNode
    className?: string
}

export function EditorBlockWrapper({ blockId, children, className }: EditorBlockWrapperProps) {
    const { isEditMode, selectedBlockId, setSelectedBlockId } = useEditorStore()

    if (!isEditMode) {
        return <div className={className}>{children}</div>
    }

    const isSelected = selectedBlockId === blockId

    return (
        <div
            className={cn(
                "relative transition-all duration-200 group border-2",
                isSelected
                    ? "border-blue-500 z-10"
                    : "border-transparent hover:border-blue-500/50",
                className
            )}
            onClick={(e) => {
                e.stopPropagation()
                setSelectedBlockId(blockId)
            }}
        >
            {isSelected && (
                <FloatingToolbar id={blockId} />
            )}

            {/* Hover Label */}
            {!isSelected && (
                <div className="absolute top-0 right-0 -translate-y-full bg-blue-500/50 text-white text-[10px] px-2 py-0.5 rounded-t opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Select
                </div>
            )}

            {children}
        </div>
    )
}
