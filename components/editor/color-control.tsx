'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card' // Not used?
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function ColorControl({ label, value, onChange, defaultHex, isExecCommand = false }: { label: string, value?: string, onChange: (v: string) => void, defaultHex: string, isExecCommand?: boolean }) {
    const displayColor = value || defaultHex

    // Preset colors matching design
    const PRESET_COLORS = [
        { label: 'Transparent', value: 'transparent' },
        { label: 'White', value: '#ffffff' },
        { label: 'Black', value: '#000000' },
        { label: 'Red', value: '#ef4444' },
        { label: 'Orange', value: '#f97316' },
        { label: 'Yellow', value: '#eab308' },
        { label: 'Green', value: '#22c55e' },
        { label: 'Blue', value: '#3b82f6' },
        { label: 'Purple', value: '#a855f7' },
        { label: 'Pink', value: '#ec4899' },
        { label: 'Gray', value: '#64748b' },
    ]

    return (
        <Popover>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-5 h-5 rounded-full border border-zinc-700 relative overflow-hidden group focus:outline-none focus:ring-1 focus:ring-white/20 shrink-0 p-0"
                                onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                            >
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
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        <p>{label}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <PopoverContent className="w-64 p-3 bg-zinc-950/95 border-zinc-800 backdrop-blur-xl" side="top" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-400 uppercase tracking-widest">Custom</Label>
                        <div className="flex gap-2 items-center">
                            {/* Color Wheel Trigger */}
                            <div className="relative w-8 h-8 rounded-full border border-zinc-700 overflow-hidden shrink-0 cursor-pointer hover:ring-1 hover:ring-white/50 bg-zinc-950 flex items-center justify-center">
                                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#3f3f46,#18181b,#3f3f46)] opacity-50" />
                                <div className="absolute inset-[3px] rounded-full bg-zinc-900 border border-zinc-800" />
                                <div className="absolute w-3 h-3 rounded-full bg-[conic-gradient(from_0deg,red,yellow,lime,aqua,blue,magenta,red)] shadow-lg" />
                                <Input
                                    type="color"
                                    className="absolute inset-0 w-full h-full p-0 border-0 opacity-0 cursor-pointer z-10"
                                    // For execCommand (text color), default to black if not set
                                    value={displayColor.startsWith('#') ? displayColor : '#000000'}
                                    onChange={(e) => onChange(e.target.value)}
                                />
                            </div>
                            <Input
                                className="h-8 bg-zinc-900 border-zinc-800 text-xs font-mono rounded-full"
                                defaultValue={value}
                                placeholder={defaultHex}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onChange(e.currentTarget.value)
                                }}
                                // Note: For text input, we might want blur to trigger update if not enter
                                onBlur={(e) => onChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-400 uppercase tracking-widest">Presets</Label>
                        <div className="grid grid-cols-6 gap-1">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    className="w-7 h-7 rounded-sm border border-zinc-800 relative overflow-hidden hover:scale-110 transition-transform focus:outline-none focus:ring-1 focus:ring-white/20"
                                    title={c.label}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => onChange(c.value)}
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
    )
}
