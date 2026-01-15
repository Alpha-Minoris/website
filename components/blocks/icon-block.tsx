'use client'

import { BlockProps } from './types'
import { IconDisplay } from '@/components/ui/icon-display'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'

export function IconBlock({ id, settings }: BlockProps) {
    const { isEditMode } = useEditorStore()

    const iconName = settings?.iconName || 'sparkles'
    const color = settings?.color
    // const backgroundColor = settings?.backgroundColor // Icon toolbar handles this if needed

    return (
        <div className={cn("flex justify-center items-center w-full h-full", isEditMode && "cursor-pointer")}>
            <IconDisplay
                name={iconName}
                className="w-full h-full transition-all"
                style={{ color }}
            />
        </div>
    )
}
