'use client'

import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Trash, ChevronDown, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlockContent, deleteChildBlock } from '@/actions/block-actions'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState, useCallback } from 'react'

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
}

interface TextToolbarProps {
    blockId: string
}

export function TextToolbar({ blockId }: TextToolbarProps) {
    const { blocks, removeBlock, setSelectedBlockId } = useEditorStore()

    // Helper to find parent section ID for a block ID
    const findParentSectionId = useCallback((childId: string): string | null => {
        const topLevel = blocks.find(b => b.id === childId)
        if (topLevel) return topLevel.id
        const parent = blocks.find(s =>
            Array.isArray(s.content) && s.content.some((child: any) => child.id === childId)
        )
        return parent ? parent.id : null
    }, [blocks])

    // Find the block data
    const findBlock = useCallback((id: string, list: any[]): any => {
        for (const block of list) {
            if (block.id === id) return block
            if (block.content && Array.isArray(block.content)) {
                const found = findBlock(id, block.content)
                if (found) return found
            }
        }
        return null
    }, [])

    const block = findBlock(blockId, blocks)

    // Local state for inputs to avoid lag
    const [localSettings, setLocalSettings] = useState(block?.settings || {})

    // Sync local state when block selection changes (external update), BUT NOT if we are editing
    // Actually, simple way: Just use local state for inputs.
    // When block changes completely, reset custom state?
    useEffect(() => {
        setLocalSettings(block?.settings || {})
    }, [blockId, blocks])

    // Debounced updater
    const [pendingUpdates, setPendingUpdates] = useState<any>(null)
    const debouncedUpdates = useDebounce(pendingUpdates, 500)

    useEffect(() => {
        if (debouncedUpdates) {
            const commitUpdates = async () => {
                const sectionId = findParentSectionId(blockId)
                if (!sectionId) return
                try {
                    // Fetch fresh settings first? Or assume local merge is safe?
                    // Merge with pending
                    await updateBlockContent(sectionId, blockId, { settings: { ...block.settings, ...debouncedUpdates } })
                } catch (err) {
                    console.error("Failed to save text settings", err)
                }
            }
            commitUpdates()
        }
    }, [debouncedUpdates, blockId, findParentSectionId, block])

    const updateSettings = (updates: any) => {
        // Immediate UI update
        const newSettings = { ...localSettings, ...updates }
        setLocalSettings(newSettings)

        // Debounce server call
        setPendingUpdates((prev: any) => ({ ...(prev || {}), ...updates }))
    }

    // Immediate update for buttons (toggle), Debounce for inputs
    const updateSettingsImmediate = async (updates: any) => {
        const newSettings = { ...localSettings, ...updates }
        setLocalSettings(newSettings)

        const sectionId = findParentSectionId(blockId)
        if (!sectionId) return
        try {
            await updateBlockContent(sectionId, blockId, { settings: newSettings })
        } catch (err) {
            console.error("Failed to save", err)
        }
    }

    const handleDelete = async () => {
        // Direct delete, no verification as requested
        const sectionId = findParentSectionId(blockId)
        if (sectionId) {
            try {
                await deleteChildBlock(sectionId, blockId)
                setSelectedBlockId(null)
            } catch (err) {
                console.error("Failed to delete", err)
            }
        }
    }

    // We rely on the parent EditorBlockWrapper to control visibility based on blockType.
    if (!block) return null

    return (
        <Card className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 flex items-center p-2 gap-2 bg-zinc-900/95 border-zinc-800 backdrop-blur-md shadow-2xl rounded-full animate-in fade-in zoom-in-95 duration-200">

            {/* Font Family */}
            <Select
                value={localSettings.fontFamily || 'Inter, sans-serif'}
                onValueChange={(val) => updateSettingsImmediate({ fontFamily: val })}
            >
                <SelectTrigger className="h-7 w-[90px] text-[10px] bg-transparent border-0 text-zinc-400 hover:text-white hover:bg-white/10 p-0 px-2 gap-1 rounded-full focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 max-h-60">
                    <SelectItem value="Inter, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer">Inter</SelectItem>
                    <SelectItem value="Space Grotesk, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-grotesk">Space Grotesk</SelectItem>
                    <SelectItem value="Arial, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-sans">Arial</SelectItem>
                    <SelectItem value="Helvetica, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-sans">Helvetica</SelectItem>
                    <SelectItem value="Verdana, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-sans">Verdana</SelectItem>
                    <SelectItem value="Times New Roman, serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-serif">Times New Roman</SelectItem>
                    <SelectItem value="Georgia, serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-serif">Georgia</SelectItem>
                    <SelectItem value="Courier New, monospace" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-mono">Courier New</SelectItem>
                </SelectContent>
            </Select>


            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Text Style / Level */}
            <Select
                value={block.settings?.level || 'h2'}
                onValueChange={(val) => updateSettingsImmediate({ level: val })}
            >
                <SelectTrigger className="h-8 w-[110px] text-xs bg-transparent border-0 text-zinc-300 hover:text-white hover:bg-white/10 p-0 px-3 gap-1 rounded-full focus:ring-0 focus:ring-offset-0 font-medium">
                    <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="h1" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-bold">Heading 1</SelectItem>
                    <SelectItem value="h2" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-bold">Heading 2</SelectItem>
                    <SelectItem value="h3" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-semibold">Heading 3</SelectItem>
                    <SelectItem value="h4" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-semibold">Heading 4</SelectItem>
                    <SelectItem value="h5" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-medium">Heading 5</SelectItem>
                    <SelectItem value="h6" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-medium">Heading 6</SelectItem>
                    <SelectItem value="p" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-normal">Normal Text</SelectItem>
                    <SelectItem value="label" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-light uppercase tracking-wider">Label</SelectItem>
                </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Font Size Stepper */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
                    onClick={() => {
                        const current = parseInt(localSettings.fontSize) || 16
                        updateSettings({ fontSize: (current - 1) + 'px' })
                    }}
                >
                    <Minus className="w-3.5 h-3.5" />
                </Button>
                <input
                    type="text"
                    className="w-8 h-7 bg-transparent text-white text-xs text-center border-none focus:outline-none"
                    value={parseInt(localSettings.fontSize) || ''}
                    onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val)) updateSettings({ fontSize: val + 'px' })
                    }}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
                    onClick={() => {
                        const current = parseInt(localSettings.fontSize) || 16
                        updateSettings({ fontSize: (current + 1) + 'px' })
                    }}
                >
                    <Plus className="w-3.5 h-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Basic Formatting */}
            <div className="flex bg-white/5 rounded-full p-0.5">
                <Button variant="ghost" size="icon" onClick={() => updateSettingsImmediate({ bold: !localSettings.bold })} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", localSettings.bold ? "text-white bg-white/20" : "text-zinc-500")}>
                    <Bold className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => updateSettingsImmediate({ italic: !localSettings.italic })} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", localSettings.italic ? "text-white bg-white/20" : "text-zinc-500")}>
                    <Italic className="w-3.5 h-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Alignment */}
            <div className="flex bg-white/5 rounded-full p-0.5">
                <Button variant="ghost" size="icon" onClick={() => updateSettingsImmediate({ align: 'left' })} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", localSettings.align === 'left' ? "text-white bg-white/20" : "text-zinc-500")}>
                    <AlignLeft className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => updateSettingsImmediate({ align: 'center' })} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", (!localSettings.align || localSettings.align === 'center') ? "text-white bg-white/20" : "text-zinc-500")}>
                    <AlignCenter className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => updateSettingsImmediate({ align: 'right' })} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", localSettings.align === 'right' ? "text-white bg-white/20" : "text-zinc-500")}>
                    <AlignRight className="w-3.5 h-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Colors */}
            <div className="flex items-center gap-1.5 px-1">
                <div className="relative group/picker">
                    <div className="w-5 h-5 rounded-full border border-white/20 overflow-hidden cursor-pointer shadow-sm" style={{ backgroundColor: localSettings.color || '#ffffff' }}>
                        <input
                            type="color"
                            className="absolute -top-2 -left-2 w-16 h-16 opacity-0 cursor-pointer"
                            onChange={(e) => updateSettings({ color: e.target.value })}
                        />
                    </div>
                </div>
                <div className="relative group/picker">
                    <div className="w-5 h-5 rounded-full border border-white/20 overflow-hidden cursor-pointer flex items-center justify-center bg-zinc-800 shadow-sm">
                        <span className="text-[7px] font-bold text-white">BG</span>
                        <input
                            type="color"
                            className="absolute -top-2 -left-2 w-16 h-16 opacity-0 cursor-pointer"
                            onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10 mx-1" />

            {/* Delete */}
            <Button variant="ghost" size="icon" onClick={handleDelete} className="h-7 w-7 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <Trash className="w-3.5 h-3.5" />
            </Button>
        </Card>
    )
}
