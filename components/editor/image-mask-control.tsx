"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Move, Maximize2, Settings2 } from "lucide-react"

interface MaskSettings {
    x: number
    y: number
    scale: number
}

interface ImageMaskControlProps {
    settings?: MaskSettings
    onChange: (settings: MaskSettings) => void
}

export function ImageMaskControl({ settings = { x: 50, y: 50, scale: 100 }, onChange }: ImageMaskControlProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] text-zinc-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-full"
                >
                    <Settings2 className="w-3 h-3 mr-1.5" />
                    Mask
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 bg-zinc-950 border-zinc-800 backdrop-blur-xl shadow-2xl rounded-2xl space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Zoom</p>
                        <span className="text-[10px] text-accent font-mono">{settings.scale}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Maximize2 className="w-3.5 h-3.5 text-zinc-600" />
                        <Slider
                            value={[settings.scale]}
                            min={100}
                            max={300}
                            step={1}
                            onValueChange={([val]) => onChange({ ...settings, scale: val })}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Pan X</p>
                        <span className="text-[10px] text-accent font-mono">{settings.x}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Move className="w-3.5 h-3.5 text-zinc-600" />
                        <Slider
                            value={[settings.x]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={([val]) => onChange({ ...settings, x: val })}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Pan Y</p>
                        <span className="text-[10px] text-accent font-mono">{settings.y}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Move className="w-3.5 h-3.5 text-zinc-600 rotate-90" />
                        <Slider
                            value={[settings.y]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={([val]) => onChange({ ...settings, y: val })}
                        />
                    </div>
                </div>

                <p className="text-[9px] text-zinc-600 italic">Adjust how the image fits within the shape.</p>
            </PopoverContent>
        </Popover>
    )
}
