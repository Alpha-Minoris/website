'use client'

import { useEditorStore } from '@/lib/stores/editor-store'
import { createGenericSection } from '@/actions/section-actions'
import { cn } from '@/lib/utils'
import { Layers, Box, Settings, Plus, LayoutTemplate, Monitor, Smartphone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useState, useRef, useEffect } from 'react'

export function EditorSidebar() {
    const { isEditMode, selectedBlockId, setSelectedBlockId, addBlock, blocks } = useEditorStore()
    const [activeTab, setActiveTab] = useState<'components' | 'layers' | 'settings' | null>(null)
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

    const toggleTab = (tab: 'components' | 'layers' | 'settings') => {
        setActiveTab(current => current === tab ? null : tab)
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
                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col gap-1 border-white/10 hover:bg-white/5 hover:text-white text-zinc-400 opacity-50 cursor-not-allowed"
                                >
                                    <Box className="w-5 h-5 opacity-50" />
                                    <span className="text-xs">Coming Soon</span>
                                </Button>
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
                                <div className="text-xs text-zinc-400">
                                    <p>Editing: <span className="text-white">{selectedBlockId}</span></p>
                                    <p className="mt-2 text-zinc-600">No properties available yet.</p>
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-500 py-4 text-center">Select a block to edit properties</p>
                            )}
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
