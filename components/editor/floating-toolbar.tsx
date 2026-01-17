'use client'

import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, Trash2, GripVertical, Grid3X3, Eye, EyeOff } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'
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

import { ColorPicker } from './color-picker'

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

    const handleToggleVisibility = async () => {
        // Toggle current state
        const newEnabledState = !isSectionEnabled

        // 1. Optimistic update (requires store update if we tracked is_enabled there, but block usually tracks generic settings)
        // For now, we might need to rely on server revalidation or store update if we add is_enabled to block model
        // Assuming block model in store has 'is_enabled' property top-level or we just refresh.

        try {
            const { updateSectionVisibility } = await import('@/actions/section-actions')
            const res = await updateSectionVisibility(id, newEnabledState)
            if (res.success) {
                // Update local store to reflect change
                updateBlockLocal(id, { is_enabled: newEnabledState })
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to toggle visibility", error)
        }
    }

    const isSectionEnabled = block?.is_enabled ?? true
    const isPreDefined = ['hero', 'mission', 'team', 'services', 'packages', 'how-we-work', 'testimonials', 'case-studies', 'faq', 'contact'].includes(block?.slug || '')

    const displayColor = settings?.backgroundColor || 'transparent'
    const currentGridSize = settings?.gridSnapSize || 0

    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/80 text-white p-1.5 rounded-full shadow-2xl border border-white/10 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 z-[60]">
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

                <PopoverContent className="w-auto p-2 bg-zinc-900/80 border-white/10 backdrop-blur-2xl shadow-2xl rounded-2xl" side="top" onClick={(e) => e.stopPropagation()}>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 px-1">Background Color</p>
                    <ColorPicker
                        value={displayColor}
                        onChange={handleBackgroundColorChange}
                        type="background"
                    />
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

                <PopoverContent className="w-40 p-2 bg-zinc-900/80 border-white/10 backdrop-blur-2xl shadow-2xl rounded-2xl" side="top" onClick={(e) => e.stopPropagation()}>
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
            {/* Visibility Toggle */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 hover:bg-white/20",
                                !isSectionEnabled ? "text-yellow-400" : "text-white"
                            )}
                            onClick={(e) => { e.stopPropagation(); handleToggleVisibility() }}
                        >
                            {isSectionEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        <p>{isSectionEnabled ? "Hide Section" : "Show Section"}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-white/20 mx-1" />

            {!isPreDefined && (
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
            )}
        </div>
    )
}

