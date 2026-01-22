'use client'

import { useState, useMemo, Suspense, lazy, memo } from 'react'
import { Search, Smile, Type } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Common Unicode Symbols
const SYMBOL_CATEGORIES = {
    "Arrows": ["→", "←", "↑", "↓", "↔", "↕", "⇒", "⇐", "⇑", "⇓", "⇔", "»", "«", "›", "‹"],
    "Math": ["×", "÷", "±", "≠", "≈", "∞", "√", "°", "∑", "∏", "π", "∆", "Ω", "μ"],
    "Currency": ["$", "€", "£", "¥", "¢", "₹", "₽", "₿"],
    "Punctuation": ["•", "—", "–", "…", "©", "®", "™", "¶", "§", "†", "‡"],
    "Shapes": ["★", "☆", "■", "□", "▲", "△", "▼", "▽", "●", "○", "◆", "◇"],
    "Check": ["✓", "✔", "✕", "✖"],
    "Misc": ["❤", "☺", "☹", "☂", "☀", "☁", "⚡", "❄", "♪", "♫"]
}

const allIcons = Object.keys(dynamicIconImports) as (keyof typeof dynamicIconImports)[]

// Memoized icon loader for Grid display
const IconWrapper = ({ name, ...props }: { name: keyof typeof dynamicIconImports, className?: string }) => {
    const LucideIcon = useMemo(() => lazy(dynamicIconImports[name]), [name])
    return (
        <Suspense fallback={<div className="w-5 h-5 bg-zinc-800/50 rounded animate-pulse" />}>
            <LucideIcon {...props} />
        </Suspense>
    )
}

interface IconSymbolPickerProps {
    onInsertSymbol: (char: string) => void
    onInsertIcon: (iconName: string) => void
}

export const IconSymbolPicker = memo(({ onInsertSymbol, onInsertIcon }: IconSymbolPickerProps) => {
    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState(60)

    const filteredIcons = useMemo(() => {
        if (!search) return allIcons
        const lower = search.toLowerCase()
        return allIcons.filter(name => name.toLowerCase().includes(lower))
    }, [search])

    const displayedIcons = filteredIcons.slice(0, limit)

    // Filter symbols if search is active (simple search)
    const filteredSymbols = useMemo(() => {
        if (!search) return SYMBOL_CATEGORIES
        const lower = search.toLowerCase()
        // If searching, return flat list or filtered categories
        // For simplicity, we just search the category names or characters?
        // Let's just return all for now or maybe flatten.
        // Actually, searching symbols by name (like "arrow") is hard without a map.
        // We'll skip symbol search for now, symbols are few.
        return SYMBOL_CATEGORIES
    }, [search])

    return (
        <div className="w-[360px] h-[400px] flex flex-col">
            <Tabs defaultValue="icons" className="w-full h-full flex flex-col">
                <div className="px-3 pt-3 pb-2">
                    <TabsList className="w-full grid grid-cols-2 mb-3">
                        <TabsTrigger value="icons" className="text-xs gap-2">
                            <Smile className="w-3.5 h-3.5" />
                            Icons
                        </TabsTrigger>
                        <TabsTrigger value="symbols" className="text-xs gap-2">
                            <Type className="w-3.5 h-3.5" />
                            Symbols
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="px-3 pb-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                        <Input
                            placeholder="Search..."
                            className="pl-8 bg-zinc-900 border-zinc-800 h-9 text-xs focus-visible:ring-1 focus-visible:ring-zinc-700"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setLimit(60)
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>

                <TabsContent value="icons" className="flex-1 min-h-0 pl-3 pr-1">
                    <ScrollArea className="h-[300px] pr-3">
                        <div className="grid grid-cols-6 gap-1 pb-4">
                            {displayedIcons.map((name) => (
                                <button
                                    key={name}
                                    className="p-1.5 rounded hover:bg-white/10 flex items-center justify-center transition-colors aspect-square text-zinc-400 hover:text-white"
                                    onClick={() => onInsertIcon(name)}
                                    title={name}
                                >
                                    <IconWrapper name={name} className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                        {displayedIcons.length < filteredIcons.length && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mb-2 text-xs text-zinc-500 hover:text-white"
                                onClick={() => setLimit(prev => prev + 60)}
                            >
                                Load More
                            </Button>
                        )}
                        {displayedIcons.length === 0 && (
                            <div className="text-center text-zinc-500 py-8 text-xs">
                                No icons found
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="symbols" className="flex-1 min-h-0 pl-3 pr-1">
                    <ScrollArea className="h-[300px] pr-3">
                        <div className="space-y-4 pb-4">
                            {Object.entries(filteredSymbols).map(([category, chars]) => (
                                <div key={category}>
                                    <h4 className="text-[10px] uppercase font-medium text-zinc-500 mb-2">{category}</h4>
                                    <div className="grid grid-cols-8 gap-1">
                                        {chars.map((char) => (
                                            <button
                                                key={char}
                                                className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 text-zinc-300 hover:text-white text-base transition-colors font-sans"
                                                onClick={() => onInsertSymbol(char)}
                                            >
                                                {char}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    )
})

IconSymbolPicker.displayName = 'IconSymbolPicker'
