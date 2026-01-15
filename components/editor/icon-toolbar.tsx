'use client'

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { IconPicker } from './icon-picker'
import { ColorControl } from './color-control'
import { ChevronDown, Smile } from 'lucide-react'
import { useState, useMemo, lazy, Suspense } from 'react'
import dynamicIconImports from 'lucide-react/dynamicIconImports'

// Helper for icon preview
const IconWrapper = ({ name }: { name: string }) => {
    const LucideIcon = useMemo(() => {
        const icon = dynamicIconImports[name as keyof typeof dynamicIconImports]
        if (!icon) return null
        return lazy(icon)
    }, [name])

    if (!LucideIcon) return <Smile className="w-4 h-4" /> // Fallback

    return (
        <Suspense fallback={<div className="w-4 h-4 bg-zinc-800 animate-pulse" />}>
            <LucideIcon className="w-4 h-4" />
        </Suspense>
    )
}


interface IconToolbarProps {
    settings: {
        iconName?: string
        color?: string
        backgroundColor?: string
    }
    onUpdate: (updates: any) => void
    onDelete?: () => void
}

export function IconToolbar({ settings, onUpdate, onDelete }: IconToolbarProps) {
    const iconName = settings.iconName || 'sparkles' // Default icon?

    return (
        <Card className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 flex items-center p-2 gap-2 bg-zinc-900/95 border-zinc-800 backdrop-blur-md shadow-2xl rounded-full animate-in fade-in zoom-in-95 duration-200">
            {/* Icon Picker Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/10 rounded-full">
                        <IconWrapper name={iconName} />
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto bg-zinc-950 border-zinc-800" side="bottom" align="start">
                    <IconPicker
                        selectedIcon={iconName}
                        onSelect={(name) => onUpdate({ iconName: name })}
                    />
                </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            <div className="flex items-center gap-1.5 px-1">
                <ColorControl
                    label="Icon Color"
                    value={settings.color}
                    defaultHex="#ffffff"
                    onChange={(v) => onUpdate({ color: v })}
                />
                {/* <ColorControl
                    label="Background"
                    value={settings.backgroundColor}
                    defaultHex="transparent"
                    onChange={(v) => onUpdate({ backgroundColor: v })}
                /> */}
            </div>

            {onDelete && (
                <>
                    <Separator orientation="vertical" className="h-4 bg-white/10" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                        onClick={onDelete}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </Button>
                </>
            )}
        </Card>
    )
}
