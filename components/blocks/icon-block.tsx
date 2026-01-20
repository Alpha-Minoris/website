'use client'

import { BlockProps } from './types'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { useMemo, lazy, Suspense } from 'react'
import { EditableAsset } from '@/components/editor/editable-asset'

export function IconDisplay({ name, className, style, color }: { name: string, className?: string, style?: React.CSSProperties, color?: string }) {
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

    const isHexColor = color?.startsWith('#')

    return (
        <Suspense fallback={<div className={cn("bg-accent/10 animate-pulse rounded", className)} />}>
            <LucideIcon
                className={cn(className, !isHexColor && (color || "text-accent"))}
                style={{ ...style, color: isHexColor ? color : style?.color }}
            />
        </Suspense>
    )
}

export function IconBlock({ id, settings, sectionSlug, slug }: BlockProps) {
    const folder = sectionSlug || slug
    const { isEditMode, updateBlock } = useEditorStore()

    const iconName = settings?.iconName || settings?.icon || 'sparkles'
    const assetType = settings?.type || 'icon'
    const assetValue = settings?.value || iconName
    const color = settings?.color
    const linkUrl = settings?.linkUrl
    const isHidden = settings?.isHidden
    const maskSettings = settings?.maskSettings

    if (isHidden && !isEditMode) return null

    const handleUpdate = (updates: any) => {
        const newSettings = { ...settings, ...updates }
        updateBlock(id, { settings: newSettings })
        import('@/actions/block-actions').then(({ updateBlockContent }) => {
            updateBlockContent(sectionSlug || slug || id, id, { settings: newSettings })
        })
    }

    const handleChange = (type: 'icon' | 'image', value: string) => {
        const newSettings = {
            ...settings,
            type,
            value,
            iconName: type === 'icon' ? value : undefined
        }
        updateBlock(id, { settings: newSettings })
        import('@/actions/block-actions').then(({ updateBlockContent }) => {
            updateBlockContent(sectionSlug || slug || id, id, { settings: newSettings })
        })
    }

    return (
        <div className={cn(
            "flex justify-center items-center w-full h-full relative group",
            isEditMode && "cursor-pointer",
            isEditMode && isHidden && "opacity-30 grayscale"
        )}>
            <EditableAsset
                type={assetType}
                value={assetValue}
                onChange={handleChange}
                onUpdate={handleUpdate}
                isEditMode={isEditMode}
                linkUrl={linkUrl}
                isHidden={isHidden}
                color={color}
                maskSettings={maskSettings}
                folder={folder}
                size={settings?.size}
                className={cn(
                    "transition-all group-hover:scale-110",
                    !settings?.size && "w-full h-full"
                )}
                iconClassName={!settings?.size ? "w-full h-full" : undefined}
            />
            {isEditMode && isHidden && (
                <Icons.EyeOff className="absolute w-4 h-4 text-white/50 top-1 right-1" />
            )}
        </div>
    )
}
