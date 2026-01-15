'use client'

import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Trash, ChevronDown, Minus, Plus, Smile } from 'lucide-react'
import { IconSymbolPicker } from './icon-symbol-picker'
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useState, useCallback, useRef } from 'react'

import { ColorControl } from './color-control'

interface TextToolbarProps {
    blockId: string
}

interface TextToolbarUIProps {
    settings: any
    onUpdate: (updates: any) => void
    onDelete?: () => void
    formatState?: { bold: boolean, italic: boolean }
}

export function TextToolbarUI({ settings, onUpdate, onDelete, formatState }: TextToolbarUIProps) {
    const [localFormatState, setLocalFormatState] = useState(formatState || { bold: false, italic: false })

    const updateUIFormatState = useCallback(() => {
        if (typeof document === 'undefined') return
        setLocalFormatState({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic')
        })
    }, [])

    useEffect(() => {
        if (formatState) {
            setLocalFormatState(formatState)
        } else {
            document.addEventListener('selectionchange', updateUIFormatState)
            updateUIFormatState()
            return () => document.removeEventListener('selectionchange', updateUIFormatState)
        }
    }, [formatState, updateUIFormatState])

    const handleExec = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val)
        updateUIFormatState()
        // If it's a color change, we might want to persist it to settings too?
        // But for Bold/Italic, it's just HTML modification.
    }

    return (
        <Card className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 flex items-center p-2 gap-2 bg-zinc-900/95 border-zinc-800 backdrop-blur-md shadow-2xl rounded-full animate-in fade-in zoom-in-95 duration-200">

            {/* Font Family */}
            <Select
                value={settings.fontFamily || 'Inter, sans-serif'}
                onValueChange={(val) => onUpdate({ fontFamily: val })}
            >
                <SelectTrigger className="h-7 w-[90px] text-[10px] bg-transparent border-0 text-zinc-400 hover:text-white hover:bg-white/10 p-0 px-2 gap-1 rounded-full focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 max-h-60">
                    <SelectItem value="Inter, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer">Inter</SelectItem>
                    <SelectItem value="Space Grotesk, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-grotesk">Space Grotesk</SelectItem>
                    <SelectItem value="Arial, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-sans">Arial</SelectItem>
                    <SelectItem value="Times New Roman, serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-serif">Times New Roman</SelectItem>
                    <SelectItem value="Courier New, monospace" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-mono">Courier New</SelectItem>
                </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Level */}
            <Select
                value={settings.level || 'h2'}
                onValueChange={(val) => onUpdate({ level: val })}
            >
                <SelectTrigger className="h-8 w-[110px] text-xs bg-transparent border-0 text-zinc-300 hover:text-white hover:bg-white/10 p-0 px-3 gap-1 rounded-full focus:ring-0 focus:ring-offset-0 font-medium">
                    <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="h1" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-bold">Heading 1</SelectItem>
                    <SelectItem value="h2" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-bold">Heading 2</SelectItem>
                    <SelectItem value="h3" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-semibold">Heading 3</SelectItem>
                    <SelectItem value="p" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-normal">Normal Text</SelectItem>
                    <SelectItem value="label" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-light uppercase tracking-wider">Textbox</SelectItem>
                </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Font Size - Immediate! */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const current = parseInt(settings.fontSize || '16')
                        onUpdate({ fontSize: (current - 1) + 'px' })
                    }}
                >
                    <Minus className="w-3.5 h-3.5" />
                </Button>
                <input
                    type="text"
                    className="w-8 h-7 bg-transparent text-white text-xs text-center border-none focus:outline-none"
                    value={parseInt(settings.fontSize || '16')}
                    onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val)) onUpdate({ fontSize: val + 'px' })
                    }}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const current = parseInt(settings.fontSize || '16')
                        onUpdate({ fontSize: (current + 1) + 'px' })
                    }}
                >
                    <Plus className="w-3.5 h-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Inline Formatting */}
            <div className="flex bg-white/5 rounded-full p-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { handleExec('bold') }}
                    className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", localFormatState.bold ? "text-white bg-white/20" : "text-zinc-500")}
                >
                    <Bold className="w-3.5 h-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { handleExec('italic') }}
                    className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", localFormatState.italic ? "text-white bg-white/20" : "text-zinc-500")}
                >
                    <Italic className="w-3.5 h-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Alignment */}
            <div className="flex bg-white/5 rounded-full p-0.5">
                <Button variant="ghost" size="icon" onClick={() => onUpdate({ align: 'left' })} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", settings.align === 'left' ? "text-white bg-white/20" : "text-zinc-500")}>
                    <AlignLeft className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onUpdate({ align: 'center' })} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", (!settings.align || settings.align === 'center') ? "text-white bg-white/20" : "text-zinc-500")}>
                    <AlignCenter className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onUpdate({ align: 'right' })} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", settings.align === 'right' ? "text-white bg-white/20" : "text-zinc-500")}>
                    <AlignRight className="w-3.5 h-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Colors using ColorControl */}
            <div className="flex items-center gap-1.5 px-1">
                <ColorControl
                    label="Text Color"
                    value={settings.color}
                    isExecCommand={true}
                    defaultHex="#000000"
                    onChange={(v) => {
                        handleExec('foreColor', v)
                        onUpdate({ color: v })
                    }}
                />

                <ColorControl
                    label="Background"
                    value={settings.backgroundColor}
                    defaultHex="transparent"
                    onChange={(v) => onUpdate({ backgroundColor: v })}
                />
            </div>

            {onDelete && (
                <>
                    <Separator orientation="vertical" className="h-4 bg-white/10 mx-1" />
                    <Button variant="ghost" size="icon" onClick={onDelete} className="h-7 w-7 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash className="w-3.5 h-3.5" />
                    </Button>
                </>
            )}

            <Separator orientation="vertical" className="h-4 bg-white/10 mx-1" />

            {/* Icon/Symbol Picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10">
                        <Smile className="w-3.5 h-3.5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-zinc-950 border-zinc-800 w-auto" side="top" sideOffset={10}>
                    <IconSymbolPicker
                        onInsertSymbol={(char) => {
                            // Restore focus logic might be needed if popover stole it, 
                            // but usually popover keeps focus context or we handle it.
                            handleExec('insertText', char)
                        }}
                        onInsertIcon={async (iconName) => {
                            // Fetch SVG string
                            // Since we are client side, we can't easily use renderToStaticMarkup of a lazy component synchronously.
                            // But we can fetch the icon source or use a simple SVG placeholder 
                            // OR better: construct a standard feather/lucide SVG string manually if we have the path data.
                            // Wait, lucide-react lazy imports return modules. 

                            // Easier approach: Use an image tag with a data URI? No, inline SVG is better.
                            // Let's try to fetch the SVG from an API or just use a generic method?
                            // Actually, dynamicIconImports contains the module.

                            try {
                                // Fetch the SVG from unpkg (lucide-static)
                                const res = await fetch(`https://unpkg.com/lucide-static@latest/icons/${iconName}.svg`)
                                if (res.ok) {
                                    const svgText = await res.text()
                                    // Clean up SVG size to be 1em inline
                                    const inlineSvg = svgText.replace('<svg', '<svg style="display:inline; height:1em; width:1em; vertical-align:-0.125em;"')
                                    handleExec('insertHTML', inlineSvg + '&nbsp;')
                                }
                            } catch (e) {
                                console.error(e)
                            }
                        }}
                    />
                </PopoverContent>
            </Popover>
        </Card>
    )
}

interface TextToolbarProps {
    blockId: string
}

export function TextToolbar({ blockId }: TextToolbarProps) {
    const { blocks, removeBlock, setSelectedBlockId, updateBlock: updateStoreBlock } = useEditorStore()

    // --- HELPERS PRESERVED ---
    const findParentSectionId = useCallback((childId: string): string | null => {
        const findSection = (blocks: any[], parentSectionId?: string): string | null => {
            for (const block of blocks) {
                if (block.id === childId) return block.id
                if (block.content && Array.isArray(block.content)) {
                    const currentSectionId = parentSectionId || block.id
                    if (block.content.some((c: any) => c.id === childId)) return currentSectionId
                    const found = findSection(block.content, currentSectionId)
                    if (found) return found
                }
                if (block.settings?.backContent && Array.isArray(block.settings.backContent)) {
                    const currentSectionId = parentSectionId || block.id
                    if (block.settings.backContent.some((c: any) => c.id === childId)) return currentSectionId
                    const found = findSection(block.settings.backContent, currentSectionId)
                    if (found) return found
                }
            }
            return null
        }
        return findSection(blocks)
    }, [blocks])

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
    // -------------------------

    const block = findBlock(blockId, blocks)

    // Local state
    const [localSettings, setLocalSettings] = useState(block?.settings || {})
    const prevSettingsRef = useRef(block?.settings)

    // Sync external changes to local state
    useEffect(() => {
        if (JSON.stringify(block?.settings) !== JSON.stringify(prevSettingsRef.current)) {
            setLocalSettings(block?.settings || {})
            prevSettingsRef.current = block?.settings
        }
    }, [block?.settings])

    // Save timeout ref
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Optimistic Update wrapper
    const handleUpdate = (updates: any) => {
        // 1. Update State
        const newSettings = { ...localSettings, ...updates }
        setLocalSettings(newSettings)

        // 2. Update Store Immediately (Snappy UI)
        updateStoreBlock(blockId, { settings: newSettings })

        // 3. Queue Server Save (Debounced)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(async () => {
            const sectionId = findParentSectionId(blockId)
            if (!sectionId) return
            try {
                // Determine current settings from store or local?
                // Best to read fresh from block (which is updated via store) or use accumulated newSettings
                // We'll use newSettings to be sure.
                await updateBlockContent(sectionId, blockId, { settings: newSettings })
            } catch (err) {
                console.error("Failed to save text settings", err)
            }
        }, 500)
    }

    // Handlers
    const handleDelete = async () => {
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

    if (!block) return null

    return (
        <TextToolbarUI
            settings={localSettings}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
        />
    )
}
