'use client'

import { BlockProps } from './types'
import { IconDisplay } from '@/components/ui/icon-display'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'

export function IconBlock({ id, settings }: BlockProps) {
    const { isEditMode } = useEditorStore()

    const iconName = settings?.iconName || 'sparkles'
    const color = settings?.color
    const linkUrl = settings?.linkUrl

    const handleIconClick = (e: React.MouseEvent) => {
        if (!isEditMode && linkUrl) {
            // Anchor tag handles default navigation, but we can ensure behavior here if needed
            // For now, let the anchor do its job.
        }
    }

    const content = (
        <div className={cn("flex justify-center items-center w-full h-full", isEditMode && "cursor-pointer")}>
            <IconDisplay
                name={iconName}
                className="w-full h-full transition-all group-hover:scale-110"
                style={{ color }}
            />
        </div>
    )

    if (linkUrl && !isEditMode) {
        const isExternal = !linkUrl.startsWith('/') && !linkUrl.startsWith('#')
        return (
            <a
                href={linkUrl}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="block w-full h-full group"
                onClick={handleIconClick}
            >
                {content}
            </a>
        )
    }

    return content
}
