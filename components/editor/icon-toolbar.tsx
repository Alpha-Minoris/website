'use client'

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { IconPicker } from './icon-picker'
import { ColorPicker } from './color-picker'
import { cn } from '@/lib/utils'
import { ChevronDown, Smile, Link, Unlink, Trash, Check, Maximize2, MoveRight, Eye, EyeOff } from 'lucide-react'
import { useState, useMemo, lazy, Suspense } from 'react'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { Input } from "@/components/ui/input"

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
        linkUrl?: string
        width?: string
        height?: string
        isHidden?: boolean
    }
    onUpdate: (updates: any) => void
    onDelete?: () => void
}

export function IconToolbar({ settings, onUpdate, onDelete }: IconToolbarProps) {
    const iconName = settings.iconName || 'sparkles'
    const [linkUrl, setLinkUrl] = useState(settings.linkUrl || '')
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)

    // Sync local linkUrl when settings change externally
    useMemo(() => {
        if (settings.linkUrl !== undefined) {
            setLinkUrl(settings.linkUrl || '')
        }
    }, [settings.linkUrl])

    const handleApplyLink = () => {
        let finalUrl = linkUrl.trim()
        if (finalUrl) {
            // Normalize: If it doesn't start with /, #, or a protocol, but looks like a domain or localhost
            if (!finalUrl.startsWith('/') && !finalUrl.startsWith('#') && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('mailto:')) {
                // If it contains a dot or is 'localhost', assume it's an external link
                if (finalUrl.includes('.') || finalUrl === 'localhost') {
                    finalUrl = 'https://' + finalUrl
                }
            }
            onUpdate({ linkUrl: finalUrl })
        } else {
            onUpdate({ linkUrl: null })
        }
        setIsLinkPopoverOpen(false)
    }

    const handleRemoveLink = () => {
        onUpdate({ linkUrl: null })
        setLinkUrl('')
        setIsLinkPopoverOpen(false)
    }

    return (
        <Card className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 flex items-center p-2 gap-2 bg-zinc-900/95 border-zinc-800 backdrop-blur-md shadow-2xl rounded-full animate-in fade-in zoom-in-95 duration-200">
            {/* Icon Picker Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/10 rounded-full focus:ring-0 focus-visible:ring-0">
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

            {/* Link Editor */}
            <div className="flex bg-white/5 rounded-full p-0.5">
                <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-7 w-7 rounded-full hover:text-white hover:bg-white/10",
                                (isLinkPopoverOpen || settings.linkUrl) ? "text-white bg-white/20" : "text-zinc-500"
                            )}
                        >
                            {settings.linkUrl ? <Unlink className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="p-1.5 flex items-center gap-2 bg-zinc-900/95 border-zinc-800 backdrop-blur-md w-auto min-w-[320px] shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200"
                        side="bottom"
                        sideOffset={10}
                        align="center"
                        avoidCollisions={false}
                    >
                        <div className="relative flex-1 group pl-2">
                            <Link className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
                            <Input
                                placeholder="Paste link..."
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="h-8 pl-6 text-xs bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-zinc-600 w-full"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleApplyLink()
                                }}
                            />
                        </div>

                        {linkUrl && (
                            <div className="relative group/preview">
                                <div className="relative w-8 h-8 shrink-0 rounded-md overflow-hidden border border-white/10 bg-black/50 cursor-help flex items-center justify-center">
                                    {(() => {
                                        const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#')
                                        const isLocalTarget = linkUrl.includes('localhost') || linkUrl.includes('127.0.0.1')
                                        if (isInternal || isLocalTarget) {
                                            return <div className="text-[8px] text-zinc-400 font-mono tracking-tighter text-center leading-none px-0.5">{isInternal ? 'INT' : 'LOC'}</div>
                                        }
                                        return (
                                            <img
                                                src={`https://api.microlink.io?url=${encodeURIComponent(linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl)}&screenshot=true&meta=false&embed=screenshot.url`}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.innerText = '?'
                                                }}
                                                alt="Preview"
                                                className="w-full h-full object-cover opacity-70 transition-opacity"
                                            />
                                        )
                                    })()}
                                </div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[480px] aspect-video bg-zinc-950 border border-white/10 shadow-2xl rounded-lg overflow-hidden opacity-0 invisible group-hover/preview:opacity-100 group-hover/preview:visible transition-all duration-200 z-50 pointer-events-none origin-bottom scale-95 group-hover/preview:scale-100">
                                    {(() => {
                                        const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#')
                                        const isLocalTarget = linkUrl.includes('localhost') || linkUrl.includes('127.0.0.1')
                                        if (isInternal || isLocalTarget) {
                                            return (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/90 p-6 space-y-2">
                                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                                                        {linkUrl.startsWith('#') ? <span className="text-xl text-zinc-400">#</span> : <Link className="w-6 h-6 text-zinc-400" />}
                                                    </div>
                                                    <p className="text-sm font-medium text-white">{isInternal ? 'Internal Link' : 'Local Target'}</p>
                                                    <p className="text-xs text-zinc-500 font-mono bg-black/50 px-2 py-1 rounded">{linkUrl}</p>
                                                </div>
                                            )
                                        }
                                        const targetUrl = linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl
                                        return <img src={`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&embed=screenshot.url`} alt="Large Preview" className="relative z-10 w-full h-full object-cover" />
                                    })()}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent z-20">
                                        <p className="text-[10px] text-zinc-300 truncate font-mono">{linkUrl}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Separator orientation="vertical" className="h-5 bg-white/10" />

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveLink}
                                className="h-7 w-7 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleApplyLink}
                                className="h-7 w-7 rounded-full text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            <div className="flex items-center gap-1.5 px-1">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 p-0 overflow-hidden relative group"
                        >
                            {(() => {
                                const isHex = settings.color?.startsWith('#')
                                const colorClass = settings.color || "text-accent"
                                return (
                                    <div
                                        className={cn("w-4 h-4 rounded-full border border-white/20 shadow-sm transition-transform group-hover:scale-110",
                                            !isHex ? colorClass.replace('text-', 'bg-') : ""
                                        )}
                                        style={isHex ? { backgroundColor: settings.color } : {}}
                                    />
                                )
                            })()}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-2 w-auto bg-zinc-950 border-white/10 shadow-2xl rounded-2xl" side="bottom">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 px-1">Icon Color</p>
                        <ColorPicker
                            value={settings.color}
                            onChange={(v) => onUpdate({ color: v })}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Visibility Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onUpdate({ isHidden: !settings.isHidden })}
                className={cn(
                    "h-7 w-7 rounded-full transition-colors",
                    settings.isHidden ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20" : "text-zinc-500 hover:text-white hover:bg-white/10"
                )}
                title={settings.isHidden ? "Hidden (click to show)" : "Visible (click to hide)"}
            >
                {settings.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Size Control */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-zinc-500 hover:text-white hover:bg-white/10">
                        <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-3 w-48 bg-zinc-950 border-zinc-800 rounded-2xl shadow-2xl space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            <span>Width</span>
                            <span className="text-accent">{settings.width || 'auto'}</span>
                        </div>
                        <Input
                            type="text"
                            placeholder="e.g. 40px, 4rem"
                            value={settings.width || ''}
                            onChange={(e) => onUpdate({ width: e.target.value })}
                            className="h-7 text-xs bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            <span>Height</span>
                            <span className="text-accent">{settings.height || 'auto'}</span>
                        </div>
                        <Input
                            type="text"
                            placeholder="e.g. 40px, 4rem"
                            value={settings.height || ''}
                            onChange={(e) => onUpdate({ height: e.target.value })}
                            className="h-7 text-xs bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <p className="text-[9px] text-zinc-600">Use px, rem, or %.</p>
                </PopoverContent>
            </Popover>

            {onDelete && (
                <>
                    <Separator orientation="vertical" className="h-4 bg-white/10" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                        onClick={onDelete}
                    >
                        <Trash className="w-3.5 h-3.5" />
                    </Button>
                </>
            )}
        </Card>
    )
}
