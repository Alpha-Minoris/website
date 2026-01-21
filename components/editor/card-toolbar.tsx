'use client'

import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock, deleteChildBlock } from '@/actions/block-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash, Settings2, FlipHorizontal, Square } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { addChildBlock } from '@/actions/block-actions'
import { BlockProps } from '@/components/blocks/types'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRef, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

import { ColorPicker } from './color-picker'

function ColorControl({ label, value, onChange, defaultHex }: { label: string, value?: string, onChange: (v: string) => void, defaultHex: string }) {
    const displayColor = value || defaultHex

    return (
        <Popover>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <button className="w-8 h-8 rounded-full border border-zinc-700 relative overflow-hidden group focus:outline-none focus:ring-1 focus:ring-white/20 shrink-0">
                                {/* Checkerboard background for transparency */}
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
                    <TooltipContentSideBottom label={label} />
                </Tooltip>
            </TooltipProvider>

            <PopoverContent className="w-auto p-2 bg-zinc-900/80 border-white/10 backdrop-blur-2xl shadow-2xl rounded-2xl" side="top">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 px-1">{label}</p>
                <ColorPicker
                    value={value}
                    onChange={onChange}
                    type="background"
                />
            </PopoverContent>
        </Popover>
    )
}

// Helper to keep code clean and fix nested Tooltip hydration issues that can happen with Popovers
function TooltipContentSideBottom({ label }: { label: string }) {
    return (
        <TooltipContent side="bottom" className="text-xs">
            <p>{label}</p>
        </TooltipContent>
    )
}

interface CardToolbarProps {
    blockId: string
    sectionId?: string
    settings: any
}

export function CardToolbar({ blockId, sectionId, settings }: CardToolbarProps) {
    const { updateBlock: updateStoreBlock, blocks } = useEditorStore()

    // Helper to find block content for auto-injection check
    const findBlock = (blocks: BlockProps[], id: string): BlockProps | null => {
        for (const block of blocks) {
            if (block.id === id) return block
            if (Array.isArray(block.content)) {
                const found = findBlock(block.content as BlockProps[], id)
                if (found) return found
            }
        }
        return null
    }


    // Determine Delete Action
    const handleDelete = async () => {
        if (!sectionId) return

        try {
            await deleteChildBlock(sectionId, blockId)
        } catch (err) {
            console.error("Failed to delete card", err)
        }
    }

    // Debounce Ref for Server Saving


    // Toggle Mode (Simple <-> Flip)
    const toggleMode = async () => {
        const newMode = settings?.mode === 'flip' ? 'simple' : 'flip'

        updateStoreBlock(blockId, { settings: { ...settings, mode: newMode } })
        await updateBlock(blockId, { settings: { ...settings, mode: newMode } })
    }

    const handleColorChange = useCallback((key: 'color' | 'backgroundColor' | 'borderColor', value: string) => {
        updateStoreBlock(blockId, { settings: { ...settings, [key]: value } })
    }, [blockId, settings, updateStoreBlock])

    return (
        <Card className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-zinc-900/80 border-white/10 backdrop-blur-2xl text-white z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 rounded-full w-auto">

            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={toggleMode} className="hover:bg-zinc-800 h-8 w-8 p-0 rounded-full">
                            {settings?.mode === 'flip' ? <FlipHorizontal className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{settings?.mode === 'flip' ? "Switch to Simple" : "Switch to Flip"}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-zinc-800" />

            {/* Compact Color Controls */}
            <div className="flex items-center gap-1.5">
                <ColorControl
                    label="Background"
                    value={settings?.backgroundColor}
                    onChange={(v) => handleColorChange('backgroundColor', v)}
                    defaultHex="transparent"
                />
                <ColorControl
                    label="Border"
                    value={settings?.borderColor}
                    onChange={(v) => handleColorChange('borderColor', v)}
                    defaultHex="transparent"
                />
            </div>

            <div className="w-px h-4 bg-zinc-800" />

            <AlertDialog>
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-red-900/20 hover:text-red-500 h-8 w-8 p-0 rounded-full"
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-red-500">Delete Card</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <AlertDialogContent className="bg-zinc-900/90 border-white/10 backdrop-blur-2xl text-white rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Card?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            This action cannot be undone. It will remove the card and all its content.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-zinc-800 hover:bg-zinc-800 text-white hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </Card>
    )
}
