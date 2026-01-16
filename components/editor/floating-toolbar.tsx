'use client'

import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, Trash2, GripVertical, Grid3X3 } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { deleteSection, updateSectionOrder } from '@/actions/section-actions'
import { updateBlock } from '@/actions/block-actions'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCallback, useRef } from 'react'

// Grid size presets
const GRID_SIZES = [
    { label: 'Off', value: 0 },
    { label: '8px', value: 8 },
    { label: '16px', value: 16 },
    { label: '24px', value: 24 },
    { label: '32px', value: 32 },
]

// Color Presets matching theme
const PRESET_COLORS = [
    { label: 'Transparent', value: 'transparent' },
    { label: 'White / Low', value: 'rgba(255,255,255,0.1)' },
    { label: 'White / Med', value: 'rgba(255,255,255,0.2)' },
    { label: 'White / High', value: 'rgba(255,255,255,0.5)' },
    { label: 'Black / Low', value: 'rgba(0,0,0,0.2)' },
    { label: 'Dark Blue', value: '#0f172a' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Emerald', value: '#10b981' },
]

interface FloatingToolbarProps {
    id: string
}

export function FloatingToolbar({ id }: FloatingToolbarProps) {
    const { blocks, removeBlock, setSelectedBlockId, updateBlock: updateBlockLocal } = useEditorStore()
    const router = useRouter()

    // Find the block to get its settings
    const block = blocks.find(b => b.id === id)
    const settings = block?.settings || {}

    // Debounce ref for color changes
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleMove = async (direction: 'up' | 'down') => {
        const currentIndex = blocks.findIndex(b => b.id === id)
        if (currentIndex === -1) return
        if (direction === 'up' && currentIndex === 0) return
        if (direction === 'down' && currentIndex === blocks.length - 1) return

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        const newBlocks = [...blocks]
        const temp = newBlocks[currentIndex]
        newBlocks[currentIndex] = newBlocks[targetIndex]
        newBlocks[targetIndex] = temp

        const updates = newBlocks.map((block, index) => ({
            id: block.id,
            sort_order: index + 1
        }))

        try {
            await updateSectionOrder(updates)
        } catch (error) {
            console.error("Failed to reorder:", error)
            alert("Failed to reorder. See console.")
        }
    }

    const handleDelete = async () => {
        try {
            const result = await deleteSection(id)
            if (result.success) {
                removeBlock(id)
                setSelectedBlockId(null)
            }
        } catch (error) {
            console.error("Failed to delete:", error)
            alert("Failed to delete. Check console for details.")
        }
    }

    const handleBackgroundColorChange = useCallback((color: string) => {
        const newSettings = { ...settings, backgroundColor: color }

        // Immediate update to store (UI feedback)
        updateBlockLocal(id, { settings: newSettings })

        // Debounced save to server
        // For sections, layout_json IS the settings, so pass backgroundColor directly
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                // Pass backgroundColor at root level for sections (layout_json = settings)
                await updateBlock(id, { backgroundColor: color })
            } catch (err) {
                console.error("Failed to update section background", err)
            }
        }, 500)
    }, [id, settings, updateBlockLocal])

    const handleGridSizeChange = useCallback((size: number) => {
        const newSettings = { ...settings, gridSnapSize: size }

        // Immediate update to store
        updateBlockLocal(id, { settings: newSettings })

        // Debounced save to server
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await updateBlock(id, { gridSnapSize: size })
            } catch (err) {
                console.error("Failed to update grid size", err)
            }
        }, 500)
    }, [id, settings, updateBlockLocal])

    const displayColor = settings?.backgroundColor || 'transparent'
    const currentGridSize = settings?.gridSnapSize || 0

    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/90 text-white p-1.5 rounded-md shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 z-[60]">
            <div className="mr-2 text-xs font-medium px-2 text-white/50 border-r border-white/10 flex items-center gap-2 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
                <span>Section</span>
            </div>

            {/* Background Color Control */}
            <Popover>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <button
                                    className="w-8 h-8 rounded-full border border-zinc-700 relative overflow-hidden group focus:outline-none focus:ring-1 focus:ring-white/20 shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/checkerboard-cross-light.png')] opacity-20" />
                                    <div
                                        className="absolute inset-0 transition-colors"
                                        style={{ background: displayColor }}
                                    />
                                    {displayColor === 'transparent' && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-px bg-red-500 rotate-45" />
                                        </div>
                                    )}
                                </button>
                            </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                            <p>Background Color</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <PopoverContent className="w-64 p-3 bg-zinc-950/95 border-zinc-800 backdrop-blur-xl" side="top" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-400 uppercase tracking-widest">Custom</Label>
                            <div className="flex gap-2 items-center">
                                <div className="relative w-8 h-8 rounded-full border border-zinc-700 overflow-hidden shrink-0 cursor-pointer hover:ring-1 hover:ring-white/50 bg-zinc-950 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#3f3f46,#18181b,#3f3f46)] opacity-50" />
                                    <div className="absolute inset-[3px] rounded-full bg-zinc-900 border border-zinc-800" />
                                    <div className="absolute w-3 h-3 rounded-full bg-[conic-gradient(from_0deg,red,yellow,lime,aqua,blue,magenta,red)] shadow-lg" />
                                    <Input
                                        type="color"
                                        className="absolute inset-0 w-full h-full p-0 border-0 opacity-0 cursor-pointer z-10"
                                        value={displayColor.startsWith('#') ? displayColor : '#000000'}
                                        onChange={(e) => handleBackgroundColorChange(e.target.value)}
                                    />
                                </div>
                                <Input
                                    className="h-8 bg-zinc-900 border-zinc-800 text-xs font-mono rounded-full"
                                    value={displayColor}
                                    placeholder="transparent"
                                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-400 uppercase tracking-widest">Presets</Label>
                            <div className="grid grid-cols-5 gap-1">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        className="w-8 h-8 rounded-full border border-zinc-800 relative overflow-hidden hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-white/20"
                                        title={c.label}
                                        onClick={() => handleBackgroundColorChange(c.value)}
                                    >
                                        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/checkerboard-cross-light.png')] opacity-20" />
                                        <div className="absolute inset-0" style={{ background: c.value }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Grid Size Control */}
            <Popover>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-white/20 text-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                    {currentGridSize > 0 && (
                                        <span className="absolute -top-1 -right-1 text-[8px] bg-blue-500 rounded-full w-3 h-3 flex items-center justify-center">
                                            {currentGridSize}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                            <p>Snap Grid: {currentGridSize > 0 ? `${currentGridSize}px` : 'Off'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <PopoverContent className="w-40 p-2 bg-zinc-950/95 border-zinc-800 backdrop-blur-xl" side="top" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-400 uppercase tracking-widest">Snap Grid</Label>
                        <div className="flex flex-col gap-1">
                            {GRID_SIZES.map((g) => (
                                <button
                                    key={g.value}
                                    className={`px-3 py-1.5 text-xs rounded-md text-left transition-colors ${currentGridSize === g.value
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-white/10 text-zinc-300'
                                        }`}
                                    onClick={() => handleGridSizeChange(g.value)}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <div className="w-px h-4 bg-white/20 mx-1" />

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/20 text-white"
                onClick={(e) => { e.stopPropagation(); handleMove('up') }}
            >
                <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/20 text-white"
                onClick={(e) => { e.stopPropagation(); handleMove('down') }}
            >
                <ArrowDown className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-white/20 mx-1" />

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this section from the website.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.stopPropagation(); handleDelete() }}
                            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

