'use client'

import { useState, useMemo, Suspense, lazy } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Create a lazy component for each icon
// This avoids bundling all icons
interface IconPickerProps {
    onSelect: (iconName: string) => void
    selectedIcon?: string
}

const allIcons = Object.keys(dynamicIconImports) as (keyof typeof dynamicIconImports)[]

// Memoized icon loader to avoid recreation
const IconWrapper = ({ name, ...props }: { name: keyof typeof dynamicIconImports, className?: string }) => {
    const LucideIcon = useMemo(() => lazy(dynamicIconImports[name]), [name])

    return (
        <Suspense fallback={<div className="w-6 h-6 bg-zinc-800/50 rounded animate-pulse" />}>
            <LucideIcon {...props} />
        </Suspense>
    )
}

export function IconPicker({ onSelect, selectedIcon }: IconPickerProps) {
    const [search, setSearch] = useState('')
    const [limit, setLimit] = useState(60)

    const filteredIcons = useMemo(() => {
        if (!search) return allIcons
        const lower = search.toLowerCase()
        return allIcons.filter(name => name.toLowerCase().includes(lower))
    }, [search])

    const displayedIcons = filteredIcons.slice(0, limit)

    return (
        <div className="flex flex-col gap-2 h-full max-h-[300px] w-[300px]">
            <div className="relative px-2 pt-2">
                <Search className="absolute left-4 top-4 w-4 h-4 text-zinc-500" />
                <Input
                    placeholder="Search icons..."
                    className="pl-9 bg-zinc-900 border-zinc-800 h-8 text-xs"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setLimit(60) // Reset limit on search
                    }}
                />
            </div>
            <ScrollArea className="flex-1 px-2 pb-2">
                <div className="grid grid-cols-6 gap-1">
                    {displayedIcons.map((name) => (
                        <button
                            key={name}
                            className={cn(
                                "p-1.5 rounded hover:bg-white/10 flex items-center justify-center transition-colors aspect-square",
                                selectedIcon === name && "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50"
                            )}
                            onClick={() => onSelect(name)}
                            title={name}
                        >
                            <IconWrapper name={name} className="w-5 h-5" />
                        </button>
                    ))}
                </div>
                {displayedIcons.length < filteredIcons.length && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs text-zinc-500 hover:text-white"
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
        </div>
    )
}
