'use client'

import { useState } from 'react'
import { Image as ImageIcon, Smile, Upload, X, Link, Unlink, Check, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { IconPicker } from '@/components/editor/icon-picker'
import { IconDisplay } from '@/components/blocks/icon-block'

interface EditableAssetProps {
    type: 'icon' | 'image'
    value: string // icon name or image url
    onChange: (type: 'icon' | 'image', value: string) => void
    onUpdate?: (updates: any) => void
    isEditMode: boolean
    className?: string
    iconClassName?: string
    linkUrl?: string
    isHidden?: boolean
}

export function EditableAsset({
    type, value, onChange, onUpdate, isEditMode, className, iconClassName, linkUrl, isHidden
}: EditableAssetProps) {
    const [isOpen, setIsOpen] = useState(false)

    const AssetContent = (
        <>
            {type === 'icon' ? (
                <IconDisplay name={value || 'user'} className={cn("text-accent", iconClassName || "w-full h-full")} />
            ) : (
                <img src={value} alt="Asset" className="w-full h-full object-cover" />
            )}
        </>
    )

    if (!isEditMode) {
        if (isHidden) return null

        const container = (
            <div className={cn("relative overflow-hidden flex items-center justify-center", className)}>
                {AssetContent}
            </div>
        )

        if (linkUrl) {
            return (
                <a href={linkUrl} target={linkUrl.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
                    {container}
                </a>
            )
        }
        return container
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className={cn(
                    "relative overflow-hidden flex items-center justify-center cursor-pointer group transition-all duration-200",
                    isEditMode && "hover:ring-2 hover:ring-accent/50 rounded-md",
                    isHidden && "opacity-30 grayscale",
                    className
                )}>
                    {AssetContent}
                    {isHidden && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <X className="w-4 h-4 text-white/50" />
                        </div>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-zinc-950 border-white/10 shadow-2xl">
                <div className="space-y-4">
                    <div className="flex bg-white/5 p-1 rounded-lg">
                        <button
                            onClick={() => onChange('icon', 'user')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
                                type === 'icon' ? "bg-accent text-white shadow-lg" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <Smile className="w-3.5 h-3.5" />
                            Icon
                        </button>
                        <button
                            onClick={() => onChange('image', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
                                type === 'image' ? "bg-accent text-white shadow-lg" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Image
                        </button>
                    </div>

                    {type === 'icon' ? (
                        <div className="space-y-4">
                            <div className="h-64 overflow-y-auto pr-2 custom-scrollbar">
                                <IconPicker
                                    selectedIcon={value}
                                    onSelect={(name) => {
                                        onChange('icon', name)
                                        setIsOpen(false)
                                    }}
                                />
                            </div>
                            {onUpdate && (
                                <>
                                    <div className="space-y-2 pt-2 border-t border-white/10">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Link URL</p>
                                            {linkUrl && (
                                                <button
                                                    onClick={() => onUpdate({ linkUrl: null })}
                                                    className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    Remove Link
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 group">
                                                <Link className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
                                                <Input
                                                    type="text"
                                                    value={linkUrl || ''}
                                                    onChange={(e) => {
                                                        onUpdate({ linkUrl: e.target.value })
                                                    }}
                                                    onBlur={(e) => {
                                                        let val = e.target.value.trim()
                                                        if (val && !val.startsWith('/') && !val.startsWith('#') && !val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('mailto:')) {
                                                            if (val.includes('.') || val.includes('localhost')) {
                                                                onUpdate({ linkUrl: 'https://' + val })
                                                            }
                                                        }
                                                    }}
                                                    className="h-8 pl-7 text-xs bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-accent/50"
                                                    placeholder="google.com, /page, or #section"
                                                />
                                            </div>
                                            {linkUrl && (
                                                <div className="relative group/preview shrink-0">
                                                    <div className="w-8 h-8 rounded-md border border-white/10 bg-black/50 flex items-center justify-center overflow-hidden">
                                                        {(() => {
                                                            const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#')
                                                            if (isInternal) return <div className="text-[8px] text-zinc-500 font-mono italic">INT</div>
                                                            return (
                                                                <img
                                                                    src={`https://api.microlink.io?url=${encodeURIComponent(linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl)}&screenshot=true&meta=false&embed=screenshot.url`}
                                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                                    alt="Preview"
                                                                    className="w-full h-full object-cover opacity-70"
                                                                />
                                                            )
                                                        })()}
                                                    </div>
                                                    <div className="absolute bottom-full right-0 mb-2 w-48 aspect-video bg-zinc-950 border border-white/10 rounded-lg shadow-2xl opacity-0 invisible group-hover/preview:opacity-100 group-hover/preview:visible transition-all duration-200 z-50 pointer-events-none overflow-hidden">
                                                        {(() => {
                                                            const target = linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl
                                                            const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#')
                                                            if (isInternal) return (
                                                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-zinc-900">
                                                                    <p className="text-[10px] text-zinc-400 font-medium">Internal Link</p>
                                                                    <p className="text-[9px] text-accent truncate w-full px-2">{linkUrl}</p>
                                                                </div>
                                                            )
                                                            return <img src={`https://api.microlink.io?url=${encodeURIComponent(target)}&screenshot=true&meta=false&embed=screenshot.url`} className="w-full h-full object-cover" alt="Large Preview" />
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Visibility</p>
                                        <button
                                            onClick={() => onUpdate({ isHidden: !isHidden })}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1 text-[10px] rounded-full transition-all border",
                                                isHidden
                                                    ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                            )}
                                        >
                                            {isHidden ? <EyeOff size={10} /> : <Eye size={10} />}
                                            {isHidden ? 'Hidden' : 'Visible'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Image URL</p>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => onChange('image', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                                placeholder="https://..."
                            />
                            <p className="text-[10px] text-zinc-600 leading-relaxed">
                                Tip: Paste a direct image link from Unsplash or your library.
                            </p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
