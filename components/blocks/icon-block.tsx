'use client'

import { BlockProps } from './types'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { useMemo, lazy, Suspense } from 'react'

export function IconDisplay({ name, className, style }: { name: string, className?: string, style?: React.CSSProperties }) {
    const LucideIcon = useMemo(() => {
        // 1. Try dynamic import (kebab-case/lowercase from IconPicker)
        const dynamicIcon = dynamicIconImports[name as keyof typeof dynamicIconImports]
        if (dynamicIcon) return lazy(dynamicIcon)

        // 2. Fallback to static Icons (PascalCase from hardcoded/legacy)
        const staticIcon = (Icons as any)[name]
        if (staticIcon) return staticIcon

        // 3. Ultimate Fallback
        return Icons.HelpCircle
    }, [name])

    return (
        <Suspense fallback={<div className={cn("bg-accent/10 animate-pulse rounded", className)} />}>
            <LucideIcon className={className} style={style} />
        </Suspense>
    )
}

export function IconBlock({ id, settings }: BlockProps) {
    const { isEditMode } = useEditorStore()

    const iconName = settings?.iconName || 'sparkles'
    const color = settings?.color
    const linkUrl = settings?.linkUrl
    const isHidden = settings?.isHidden

    if (isHidden && !isEditMode) return null

    const handleIconClick = (e: React.MouseEvent) => {
        if (!isEditMode && linkUrl) {
            // Anchor tag handles default navigation, but we can ensure behavior here if needed
            // For now, let the anchor do its job.
        }
    }

    const content = (
        <div className={cn(
            "flex justify-center items-center w-full h-full",
            isEditMode && "cursor-pointer",
            isEditMode && isHidden && "opacity-30 grayscale"
        )}>
            <IconDisplay
                name={iconName}
                className="w-full h-full transition-all group-hover:scale-110"
                style={{ color }}
            />
            {isEditMode && isHidden && (
                <Icons.EyeOff className="absolute w-4 h-4 text-white/50" />
            )}
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
