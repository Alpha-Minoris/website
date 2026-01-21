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

export function IconBlock(block: BlockProps) {
    const { id, slug } = block
    const folder = slug
    const { isEditMode, updateBlock } = useEditorStore()

    const iconName = block?.iconName || block?.icon || 'sparkles'
    const assetType = block?.type || 'icon'
    const assetValue = block?.value || iconName
    const color = block?.color
    const linkUrl = block?.linkUrl
    const isHidden = block?.isHidden
    const maskSettings = block?.maskSettings

    if (isHidden && !isEditMode) return null

    const handleUpdate = (updates: any) => {
        const newblock = { ...block, ...updates }
        updateBlock(id, { block: newblock })
    }

    const handleChange = (type: 'icon' | 'image', value: string) => {
        const newblock = {
            ...block,
            type,
            value,
            iconName: type === 'icon' ? value : undefined
        }
        updateBlock(id, { block: newblock })
    }

    return (
        <div className={cn(
            "flex justify-center items-center w-full h-full relative group",
            isEditMode && "cursor-pointer",
            isEditMode && isHidden && "opacity-30 grayscale"
        )}>
            <EditableAsset
                type={assetType as 'icon' | 'image'}
                value={assetValue}
                onChange={handleChange}
                onUpdate={handleUpdate}
                isEditMode={isEditMode}
                linkUrl={linkUrl}
                isHidden={isHidden}
                color={color}
                maskSettings={maskSettings}
                folder={folder}
                size={block?.size}
                className={cn(
                    "transition-all group-hover:scale-110",
                    !block?.size && "w-full h-full"
                )}
                iconClassName={!block?.size ? "w-full h-full" : undefined}
            />
            {isEditMode && isHidden && (
                <Icons.EyeOff className="absolute w-4 h-4 text-white/50 top-1 right-1" />
            )}
        </div>
    )
}




