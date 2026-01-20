'use client'

import * as React from 'react'
import { useState } from 'react'
import { Image as ImageIcon, Smile, Upload, X, Link, Unlink, Check, Eye, EyeOff, Minus, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { IconPicker } from '@/components/editor/icon-picker'
import { IconDisplay } from '@/components/blocks/icon-block'

import { MediaManager } from '@/components/editor/media-manager'
import { ColorPicker } from '@/components/editor/color-picker'
import { ImageMaskControl } from '@/components/editor/image-mask-control'

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
    maskSettings?: { x: number, y: number, scale: number, shape?: 'circle' | 'square' }
    color?: string
    folder?: string
    placeholderText?: string
    size?: number
}

export function EditableAsset({
    type, value, onChange, onUpdate, isEditMode, className, iconClassName, linkUrl, isHidden, maskSettings, color, folder, placeholderText, size
}: EditableAssetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false)

    // Remember last values to avoid resetting to defaults on switch
    const [lastIcon, setLastIcon] = useState(type === 'icon' ? value : 'user')
    const [lastImage, setLastImage] = useState(type === 'image' ? value : '')

    // Update the memory when values change externaly or internally
    React.useEffect(() => {
        if (type === 'icon' && value) setLastIcon(value)
        if (type === 'image' && value) setLastImage(value)
    }, [type, value])

    // Mask Styles
    const maskStyle: React.CSSProperties = type === 'image' && maskSettings ? {
        backgroundPosition: `${maskSettings.x}% ${maskSettings.y}%`,
        backgroundSize: `${maskSettings.scale}%`,
        borderRadius: maskSettings.shape === 'circle' ? '9999px' : undefined
    } : {
        objectFit: 'cover'
    }

    const isHexColor = color?.startsWith('#')

    const AssetContent = (
        <>
            {type === 'icon' ? (
                <IconDisplay
                    name={value || 'user'}
                    className={cn(
                        !size && iconClassName,  // Only use iconClassName when size is not set
                        !size && !iconClassName && "w-full h-full"  // Default fallback
                    )}
                    color={color}
                    style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
                />
            ) : (
                <div
                    className="w-full h-full bg-cover bg-no-repeat bg-center transition-all duration-200 flex items-center justify-center overflow-hidden"
                    style={{
                        backgroundImage: value ? `url(${value})` : 'none',
                        ...maskStyle
                    }}
                >
                    {!value && placeholderText && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{placeholderText}</span>
                    )}
                    {!value && !placeholderText && (
                        <ImageIcon className="w-1/2 h-1/2 text-zinc-800" />
                    )}
                </div>
            )}
        </>
    )

    if (!isEditMode) {
        if (isHidden) return null

        const container = (
            <div className={cn("relative overflow-hidden flex items-center justify-center w-full h-full", className)}>
                {AssetContent}
            </div>
        )

        if (linkUrl) {
            return (
                <a href={linkUrl} target={linkUrl.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="w-full h-full block">
                    {container}
                </a>
            )
        }
        return container
    }

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <div className={cn(
                        "relative overflow-hidden flex items-center justify-center cursor-pointer group transition-all duration-200 w-full h-full",
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
                <PopoverContent className="w-80 p-4 bg-zinc-900/80 border-white/10 backdrop-blur-2xl shadow-2xl rounded-2xl">
                    <div className="space-y-4">
                        <div className="flex bg-white/5 p-1 rounded-lg">
                            <button
                                onClick={() => {
                                    onChange('icon', lastIcon)
                                }}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
                                    type === 'icon' ? "bg-accent text-white shadow-lg" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                <Smile className="w-3.5 h-3.5" />
                                Icon
                            </button>
                            <button
                                onClick={() => {
                                    onChange('image', lastImage)
                                }}
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
                                <div className="h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    <IconPicker
                                        selectedIcon={value}
                                        onSelect={(name) => {
                                            onChange('icon', name)
                                        }}
                                    />
                                </div>

                                {onUpdate && (
                                    <div className="pt-2 border-t border-white/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Size</p>
                                            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-sm hover:bg-white/10 text-zinc-400 hover:text-white"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdate({ size: Math.max(8, (size || 32) - 4) });
                                                    }}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="min-w-[24px] text-center text-[10px] font-mono text-zinc-400">
                                                    {size || 32}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-sm hover:bg-white/10 text-zinc-400 hover:text-white"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdate({ size: (size || 32) + 4 });
                                                    }}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {onUpdate && (
                                    <>
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Color</p>
                                            <ColorPicker
                                                value={color}
                                                onChange={(c) => onUpdate({ color: c })}
                                            />
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-white/10">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Link URL</p>
                                                {linkUrl && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-auto p-0 text-[10px] text-red-400 hover:text-red-300 transition-colors"
                                                        onClick={() => onUpdate({ linkUrl: null })}
                                                    >
                                                        Remove Link
                                                    </Button>
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
                                                        placeholder="google.com, /page"
                                                    />
                                                </div>
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
                                <div className="flex flex-col gap-3">
                                    <Button
                                        className="w-full justify-start text-zinc-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10"
                                        onClick={() => {
                                            setIsOpen(false)
                                            setIsMediaManagerOpen(true)
                                        }}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose / Upload Image
                                    </Button>

                                    {onUpdate && (
                                        <div className="flex justify-between items-center border-t border-white/10 pt-3">
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Mask Editor</p>
                                            <ImageMaskControl
                                                imageUrl={value}
                                                settings={maskSettings}
                                                onChange={(s) => onUpdate({ maskSettings: s })}
                                            />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-zinc-600 leading-relaxed">
                                    Upload custom images or select from library. Use 'Mask' to position.
                                </p>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover >

            <MediaManager
                open={isMediaManagerOpen}
                onOpenChange={(v) => {
                    setIsMediaManagerOpen(v)
                    if (!v) setIsOpen(true) // Re-open settings when closed
                }}
                folder={folder}
                onSelect={(asset) => {
                    onChange('image', asset.value)
                }}
            />
        </>
    )
}
