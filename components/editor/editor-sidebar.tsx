'use client'

import { useEditorStore } from '@/lib/stores/editor-store'
import { createGenericSection } from '@/actions/section-actions'
import { addChildBlock, updateBlock } from '@/actions/block-actions'
import { cn } from '@/lib/utils'
import { Layers, Box, Settings, Plus, LayoutTemplate, Monitor, Smartphone, Tablet, Type, Palette, Square, Link } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useState, useRef, useEffect } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function EditorSidebar() {
    const { isEditMode, selectedBlockId, setSelectedBlockId, addBlock, blocks } = useEditorStore()
    const [activeTab, setActiveTab] = useState<'components' | 'layers' | 'settings' | 'theme' | null>(null)
    const islandRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (islandRef.current && !islandRef.current.contains(event.target as Node)) {
                setActiveTab(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!isEditMode) return null

    const toggleTab = (tab: 'components' | 'layers' | 'settings' | 'theme') => {
        setActiveTab(current => current === tab ? null : tab)
    }

    // Logic to find the correct Parent ID for adding new blocks
    let targetParentId: string | null = null
    let targetField: 'content' | 'backContent' = 'content'
    const canAdd = !!selectedBlockId

    if (selectedBlockId) {
        // 1. Check if selected is a Section
        const isSection = blocks.find(b => b.id === selectedBlockId)
        if (isSection) {
            targetParentId = isSection.id
        } else {
            // 2. Check if selected is a Block. We need to find WHAT it is.
            // Since we only have `blocks` (sections), we need to search.
            // But wait, `useEditorStore` might not have full deep index.
            // We can find the container.

            // Simple Heuristic:
            // If the selected block is a Card, we want to add TO the card?
            // Or do we want to add NEXT to the card?
            // The user said: "I can still not add a text to the card from the menu it just gets added to the section"
            // This implies if they select a Card, they want to add INSIDE.

            // We need to know if the selected block is a container.
            // We can find the block in the tree.

            const findBlock = (nodes: any[]): any => {
                for (const node of nodes) {
                    if (node.id === selectedBlockId) return node
                    if (Array.isArray(node.content)) {
                        const found = findBlock(node.content)
                        if (found) return found
                    }
                    if (Array.isArray(node.settings?.backContent)) {
                        const found = findBlock(node.settings.backContent)
                        if (found) return found
                    }
                }
                return null
            }

            const selectedBlock = findBlock(blocks)
            if (selectedBlock && (selectedBlock.type === 'card' || selectedBlock.type === 'grid' || selectedBlock.type === 'generic-section')) {
                targetParentId = selectedBlock.id
                // If it's a card, default to content (front).
                // TODO: If we could detect flip state, we could switch to backContent.
                // But usually user selects a CHILD to verify context.
            } else {
                // If it's a leaf node (text, image), add to its PARENT.
                // We need to find the parent ID and WHICH FIELD it belongs to.
                const findParent = (nodes: any[], parentId: string): { id: string, field: 'content' | 'backContent' } | null => {
                    for (const node of nodes) {
                        if (node.id === selectedBlockId) return { id: parentId, field: 'content' } // Parent passed in. Wait, if nodes came from backContent...

                        // Check children
                        if (Array.isArray(node.content)) {
                            const found = findParent(node.content, node.id)
                            if (found) return found
                        }
                        if (Array.isArray(node.settings?.backContent)) {
                            // If found in backContent, returns parent=node.id, field='backContent'?
                            // No, recursive call needs to know context.
                            // Let's refactor findParent to be smarter.
                            const found = findParentInArray(node.settings.backContent, node.id, 'backContent')
                            if (found) return found
                        }
                    }
                    return null
                }

                const findParentInArray = (nodes: any[], parentId: string, field: 'content' | 'backContent'): { id: string, field: 'content' | 'backContent' } | null => {
                    for (const node of nodes) {
                        if (node.id === selectedBlockId) return { id: parentId, field }

                        // Recurse
                        if (Array.isArray(node.content)) {
                            const found = findParentInArray(node.content, node.id, 'content')
                            if (found) return found
                        }
                        if (Array.isArray(node.settings?.backContent)) {
                            const found = findParentInArray(node.settings.backContent, node.id, 'backContent')
                            if (found) return found
                        }
                    }
                    return null
                }

                // Iterate sections
                for (const s of blocks) {
                    if (s.id === selectedBlockId) {
                        targetParentId = s.id
                        targetField = 'content'
                        break
                    }

                    if (s.content) {
                        const p = findParentInArray(s.content, s.id, 'content')
                        if (p) {
                            targetParentId = p.id
                            targetField = p.field
                            break
                        }
                    }
                }
            }
        }
    }

    return (
        <div
            ref={islandRef}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
        >
            {/* Main Interactive Island */}
            <Card className="p-1.5 px-3 bg-zinc-950/90 border-white/10 backdrop-blur-xl shadow-2xl flex flex-row items-center gap-2 rounded-full ring-1 ring-white/10">

                {/* Brand / Home */}
                <div className="w-2 h-2 rounded-full bg-emerald-500 mx-1" />

                <Separator orientation="vertical" className="h-4 bg-white/10" />

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTab('components')}
                        className={cn(
                            "rounded-full px-3 h-8 text-xs hover:bg-white/5 transition-all gap-1.5",
                            activeTab === 'components' ? "bg-white/10 text-white" : "text-zinc-400"
                        )}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTab('theme')}
                        className={cn(
                            "rounded-full px-3 h-8 text-xs hover:bg-white/5 transition-all gap-1.5",
                            activeTab === 'theme' ? "bg-white/10 text-white" : "text-zinc-400"
                        )}
                    >
                        <Palette className="w-3.5 h-3.5" />
                        Theme
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTab('layers')}
                        className={cn(
                            "rounded-full px-3 h-8 text-xs hover:bg-white/5 transition-all gap-1.5",
                            activeTab === 'layers' ? "bg-white/10 text-white" : "text-zinc-400"
                        )}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        Layers
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTab('settings')}
                        className={cn(
                            "rounded-full px-3 h-8 text-xs hover:bg-white/5 transition-all gap-1.5",
                            activeTab === 'settings' ? "bg-white/10 text-white" : "text-zinc-400"
                        )}
                    >
                        <Settings className="w-3.5 h-3.5" />
                        Props
                    </Button>
                </div>

                <Separator orientation="vertical" className="h-4 bg-white/10" />

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white">
                        <Monitor className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white">
                        <Tablet className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white">
                        <Smartphone className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </Card>

            {/* Dropdown Content Area (Absolutely positioned to stay centered) */}
            {activeTab && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[320px] origin-top animate-in fade-in slide-in-from-top-2 duration-200">

                    {activeTab === 'components' && (
                        <Card className="bg-zinc-950/90 border-white/10 p-4 backdrop-blur-xl shadow-2xl text-white">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Components</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col gap-1 border-white/10 hover:bg-white/5 hover:text-white text-zinc-400"
                                    onClick={async () => {
                                        try {
                                            await createGenericSection()
                                            // The server action revalidates path, but we might need a hard refresh 
                                            // or just wait for the router to pick it up.
                                            // For now, let's rely on Next.js server action revalidation.
                                        } catch (error) {
                                            console.error("Failed to create section:", error)
                                            alert("Failed to create section. See console.")
                                        }
                                    }}
                                >
                                    <LayoutTemplate className="w-5 h-5 opacity-50" />
                                    <span className="text-xs">Generic Section</span>
                                </Button>
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className={!canAdd ? "cursor-not-allowed opacity-50" : ""}>
                                                <Button
                                                    variant="outline"
                                                    disabled={!canAdd}
                                                    className="h-20 w-full flex flex-col gap-1 border-white/10 hover:bg-white/5 hover:text-white text-zinc-400 disabled:opacity-100 disabled:pointer-events-none"
                                                    onClick={async () => {
                                                        if (!targetParentId) return
                                                        const newHeading = {
                                                            id: uuidv4(),
                                                            type: 'heading',
                                                            content: 'New Heading',
                                                            settings: { level: 'h2', align: 'center' }
                                                        }
                                                        try {
                                                            await addChildBlock(targetParentId, newHeading, targetField)
                                                        } catch (err) {
                                                            console.error("Failed to add heading", err)
                                                        }
                                                    }}
                                                >
                                                    <Type className="w-5 h-5 opacity-50" />
                                                    <span className="text-xs">Text Block</span>
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!canAdd && (
                                            <TooltipContent side="bottom" className="bg-red-500/90 text-white border-0 text-xs">
                                                <p>Select a container (section or card)</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className={!canAdd ? "cursor-not-allowed opacity-50" : ""}>
                                                <Button
                                                    variant="outline"
                                                    disabled={!canAdd}
                                                    className="h-20 w-full flex flex-col gap-1 border-white/10 hover:bg-white/5 hover:text-white text-zinc-400 disabled:opacity-100 disabled:pointer-events-none"
                                                    onClick={async () => {
                                                        if (!targetParentId) return
                                                        const newCard = {
                                                            id: uuidv4(),
                                                            type: 'card',
                                                            content: [],
                                                            settings: {
                                                                mode: 'simple',
                                                                variant: 'default',
                                                                width: '100%',
                                                                minHeight: '200px'
                                                            }
                                                        }
                                                        try {
                                                            await addChildBlock(targetParentId, newCard, targetField)
                                                        } catch (err) {
                                                            console.error("Failed to add card", err)
                                                        }
                                                    }}
                                                >
                                                    <Square className="w-5 h-5 opacity-50" />
                                                    <span className="text-xs">Card</span>
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!canAdd && (
                                            <TooltipContent side="bottom" className="bg-red-500/90 text-white border-0 text-xs">
                                                <p>Select a container (section or card)</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className={!canAdd ? "cursor-not-allowed opacity-50" : ""}>
                                                <Button
                                                    variant="outline"
                                                    disabled={!canAdd}
                                                    className="h-20 w-full flex flex-col gap-1 border-white/10 hover:bg-white/5 hover:text-white text-zinc-400 disabled:opacity-100 disabled:pointer-events-none"
                                                    onClick={async () => {
                                                        if (!targetParentId) return
                                                        const newIcon = {
                                                            id: uuidv4(),
                                                            type: 'icon',
                                                            content: '', // not used
                                                            settings: { iconName: 'sparkles', width: '2rem', height: '2rem' }
                                                        }
                                                        try {
                                                            await addChildBlock(targetParentId, newIcon, targetField)
                                                        } catch (err) {
                                                            console.error("Failed to add icon", err)
                                                        }
                                                    }}
                                                >
                                                    <div className="w-5 h-5 flex items-center justify-center">✨</div>
                                                    <span className="text-xs">Icon</span>
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!canAdd && (
                                            <TooltipContent side="bottom" className="bg-red-500/90 text-white border-0 text-xs">
                                                <p>Select a container (section or card)</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'layers' && (
                        <Card className="bg-zinc-950/90 border-white/10 p-4 backdrop-blur-xl shadow-2xl text-white">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Layers</h3>
                            </div>
                            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                                {blocks.length === 0 ? (
                                    <p className="text-xs text-zinc-500 py-4 text-center">No blocks added</p>
                                ) : (
                                    blocks.map((block, i) => (
                                        <div
                                            key={block.id}
                                            className={cn(
                                                "text-xs px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer flex items-center gap-2 group justify-between",
                                                selectedBlockId === block.id ? "bg-white/10 text-white" : "text-zinc-400"
                                            )}
                                            onClick={() => setSelectedBlockId(block.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 flex items-center justify-center text-[10px] bg-white/5 rounded text-zinc-500">{i + 1}</span>
                                                <span>{block.type}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'settings' && (
                        <Card className="bg-zinc-950/90 border-white/10 p-4 backdrop-blur-xl shadow-2xl text-white">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Properties</h3>
                            </div>
                            {selectedBlockId ? (
                                <div className="space-y-4">
                                    <div className="text-xs text-zinc-400 border-b border-white/10 pb-2 mb-2">
                                        Editing: <span className="text-white font-mono">{selectedBlockId.slice(0, 8)}...</span>
                                    </div>

                                    <div className="space-y-3">
                                        {(() => {
                                            const selectedBlock = blocks.find(b => b.id === selectedBlockId)
                                            const settings = selectedBlock?.settings || {}

                                            return (
                                                <>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Direction</label>
                                                        <div className="flex bg-white/5 rounded-md p-1 gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => updateBlock(selectedBlockId, { settings: { ...settings, direction: 'row' } })}
                                                                className={cn("h-6 flex-1 text-[10px]", settings.direction === 'row' ? "bg-white/10 text-white" : "hover:bg-white/10")}
                                                            >
                                                                Row
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => updateBlock(selectedBlockId, { settings: { ...settings, direction: 'column' } })}
                                                                className={cn("h-6 flex-1 text-[10px]", settings.direction === 'column' ? "bg-white/10 text-white" : "hover:bg-white/10")}
                                                            >
                                                                Col
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Justify</label>
                                                        <div className="flex bg-white/5 rounded-md p-1 gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => updateBlock(selectedBlockId, { settings: { ...settings, justify: 'start' } })} className={cn("h-6 flex-1 text-[10px]", settings.justify === 'start' ? "bg-white/10 text-white" : "hover:bg-white/10")}>Start</Button>
                                                            <Button variant="ghost" size="sm" onClick={() => updateBlock(selectedBlockId, { settings: { ...settings, justify: 'center' } })} className={cn("h-6 flex-1 text-[10px]", settings.justify === 'center' ? "bg-white/10 text-white" : "hover:bg-white/10")}>Center</Button>
                                                            <Button variant="ghost" size="sm" onClick={() => updateBlock(selectedBlockId, { settings: { ...settings, justify: 'end' } })} className={cn("h-6 flex-1 text-[10px]", settings.justify === 'end' ? "bg-white/10 text-white" : "hover:bg-white/10")}>End</Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Align</label>
                                                        <div className="flex bg-white/5 rounded-md p-1 gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => updateBlock(selectedBlockId, { settings: { ...settings, align: 'start' } })} className={cn("h-6 flex-1 text-[10px]", settings.align === 'start' ? "bg-white/10 text-white" : "hover:bg-white/10")}>Start</Button>
                                                            <Button variant="ghost" size="sm" onClick={() => updateBlock(selectedBlockId, { settings: { ...settings, align: 'center' } })} className={cn("h-6 flex-1 text-[10px]", settings.align === 'center' ? "bg-white/10 text-white" : "hover:bg-white/10")}>Center</Button>
                                                            <Button variant="ghost" size="sm" onClick={() => updateBlock(selectedBlockId, { settings: { ...settings, align: 'end' } })} className={cn("h-6 flex-1 text-[10px]", settings.align === 'end' ? "bg-white/10 text-white" : "hover:bg-white/10")}>End</Button>
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        })()}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-500 py-4 text-center">Select a block to edit properties</p>
                            )}
                        </Card>
                    )}
                </div>
            )
            }
        </div >
    )
}
