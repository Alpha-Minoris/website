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

import { ColorPicker } from './color-picker'

export function ColorControl({ label, value, onChange, defaultHex, isExecCommand = false }: { label: string, value?: string, onChange: (v: string) => void, defaultHex: string, isExecCommand?: boolean }) {
    const displayColor = value || defaultHex

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

            <PopoverContent className="w-auto p-2 bg-zinc-950/95 border-zinc-800 backdrop-blur-xl shadow-2xl rounded-2xl" side="top" onOpenAutoFocus={(e) => e.preventDefault()}>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 px-1">{label}</p>
                <ColorPicker
                    value={value}
                    onChange={onChange}
                    type={isExecCommand ? 'text' : 'background'}
                />
            </PopoverContent>
        </Popover>
    )
}
