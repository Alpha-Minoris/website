"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Move, Maximize2, Settings2, Circle, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface MaskSettings {
    x: number
    y: number
    scale: number
    shape?: 'circle' | 'square'
}

interface ImageMaskControlProps {
    imageUrl?: string
    settings?: MaskSettings
    onChange: (settings: MaskSettings) => void
}

export function ImageMaskControl({ imageUrl, settings = { x: 50, y: 50, scale: 100, shape: 'square' }, onChange }: ImageMaskControlProps) {
    const viewportRef = React.useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !viewportRef.current) return

        const rect = viewportRef.current.getBoundingClientRect()

        // Calculate relative position (0-100)
        // Note: inverted because we're moving the background/image
        // Actually, let's keep it simple: drag move
        const newX = Math.max(0, Math.min(100, settings.x + (e.movementX / rect.width) * -100))
        const newY = Math.max(0, Math.min(100, settings.y + (e.movementY / rect.height) * -100))

        onChange({ ...settings, x: newX, y: newY })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        const zoomStep = 5
        const newScale = Math.max(100, Math.min(500, settings.scale + (e.deltaY > 0 ? -zoomStep : zoomStep)))
        onChange({ ...settings, scale: newScale })
    }

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
            <PopoverContent className="w-72 p-4 bg-zinc-950 border-zinc-800 backdrop-blur-xl shadow-2xl rounded-2xl space-y-4 overflow-hidden">
                <div className="space-y-4">
                    {/* Visual Viewport */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Visual Preview</p>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-6 w-6", settings.shape === 'square' ? "text-accent bg-accent/10" : "text-zinc-600")}
                                    onClick={() => onChange({ ...settings, shape: 'square' })}
                                >
                                    <Square className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-6 w-6", settings.shape === 'circle' ? "text-accent bg-accent/10" : "text-zinc-600")}
                                    onClick={() => onChange({ ...settings, shape: 'circle' })}
                                >
                                    <Circle className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        <div
                            ref={viewportRef}
                            className={cn(
                                "relative w-full aspect-square bg-zinc-900 border border-white/5 overflow-hidden cursor-move select-none transition-all",
                                settings.shape === 'circle' ? "rounded-full" : "rounded-xl"
                            )}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onWheel={handleWheel}
                        >
                            {imageUrl ? (
                                <div
                                    className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
                                    style={{
                                        backgroundImage: `url(${imageUrl})`,
                                        backgroundPosition: `${settings.x}% ${settings.y}%`,
                                        backgroundSize: `${settings.scale}%`
                                    }}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-700 uppercase tracking-widest font-bold">
                                    No Image
                                </div>
                            )}

                            {/* Visual Hint */}
                            <div className="absolute inset-0 border-2 border-accent/20 pointer-events-none rounded-inherit" />
                        </div>
                        <p className="text-[9px] text-zinc-600 text-center">Drag to pan • Scroll to zoom</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-white/5">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Zoom Level</p>
                                <span className="text-[10px] text-accent font-mono">{settings.scale}%</span>
                            </div>
                            <Slider
                                value={[settings.scale]}
                                min={100}
                                max={500}
                                step={1}
                                onValueChange={([val]) => onChange({ ...settings, scale: val })}
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
