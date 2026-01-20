'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GradientConfig, ColorStop, gradientToCSS } from '@/lib/utils/gradient-utils'

interface GradientPickerProps {
    value: GradientConfig
    onChange: (config: GradientConfig) => void
    className?: string
}

export function GradientPicker({ value, onChange, className }: GradientPickerProps) {
    const [draggingStop, setDraggingStop] = useState<number | null>(null)
    const barRef = useRef<HTMLDivElement>(null)
    const colorInputRefs = useRef<(HTMLInputElement | null)[]>([])
    const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const handleStopColorChange = useCallback((index: number, color: string) => {
        // Debounce color changes to prevent staggering
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
            const newStops = [...value.stops]
            newStops[index] = { ...newStops[index], color }
            onChange({ ...value, stops: newStops })
        }, 16) // ~60fps
    }, [value, onChange])

    const handleStopPositionChange = useCallback((index: number, position: number) => {
        const newStops = [...value.stops]
        newStops[index] = { ...newStops[index], position: Math.max(0, Math.min(100, position)) }
        onChange({ ...value, stops: newStops })
    }, [value, onChange])

    const handleAddStop = useCallback(() => {
        // Allow unlimited stops
        const newStop: ColorStop = { color: '#ffffff', position: 50 }
        const newStops = [...value.stops, newStop].sort((a, b) => a.position - b.position)
        onChange({ ...value, stops: newStops })
    }, [value, onChange])

    const handleAngleChange = useCallback((angle: number) => {
        onChange({ ...value, angle })
    }, [value, onChange])

    const handleDeleteStop = useCallback((index: number) => {
        // Prevent deleting if only 2 stops left (minimum for gradient)
        if (value.stops.length <= 2) return

        const newStops = value.stops.filter((_, i) => i !== index)
        onChange({ ...value, stops: newStops })
    }, [value, onChange])

    // Drag handlers
    const handleStopMouseDown = useCallback((index: number, e: React.MouseEvent) => {
        // Only start drag if not clicking on the color input itself
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
            e.preventDefault()
            e.stopPropagation()
            setDraggingStop(index)
        }
    }, [])

    const handleStopClick = useCallback((index: number, e: React.MouseEvent) => {
        // Open color picker on double-click only
        if (e.detail === 2 && (e.target as HTMLElement).tagName !== 'INPUT') {
            e.stopPropagation()
            colorInputRefs.current[index]?.click()
        }
    }, [])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (draggingStop === null || !barRef.current) return

        const rect = barRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))

        handleStopPositionChange(draggingStop, percentage)
    }, [draggingStop, handleStopPositionChange])

    const handleMouseUp = useCallback(() => {
        setDraggingStop(null)
    }, [])

    // Global mouse listeners for dragging
    useEffect(() => {
        if (draggingStop !== null) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [draggingStop, handleMouseMove, handleMouseUp])

    const cssGradient = gradientToCSS(value)

    return (
        <div className={cn("space-y-2.5", className)}>
            {/* Type Toggle */}
            <div className="flex gap-1">
                <Button
                    size="sm"
                    variant={value.type === 'linear' ? 'default' : 'ghost'}
                    onClick={() => onChange({ ...value, type: 'linear' })}
                    className="flex-1 h-7 text-xs"
                >
                    Linear
                </Button>
                <Button
                    size="sm"
                    variant={value.type === 'radial' ? 'default' : 'ghost'}
                    onClick={() => onChange({ ...value, type: 'radial' })}
                    className="flex-1 h-7 text-xs"
                >
                    Radial
                </Button>
            </div>

            {/* Direction Controls (Linear only) */}
            {value.type === 'linear' && (
                <div className="flex items-center gap-2">
                    <Label className="text-xs text-zinc-400 min-w-[60px]">{value.angle || 180}°</Label>
                    <div className="flex gap-0.5">
                        <Button size="sm" variant="ghost" onClick={() => handleAngleChange(0)} className="h-6 w-6 p-0 text-xs">↑</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAngleChange(90)} className="h-6 w-6 p-0 text-xs">→</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAngleChange(180)} className="h-6 w-6 p-0 text-xs">↓</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAngleChange(270)} className="h-6 w-6 p-0 text-xs">←</Button>
                    </div>
                    <Slider
                        value={[value.angle || 180]}
                        onValueChange={([v]) => handleAngleChange(v)}
                        min={0}
                        max={360}
                        step={15}
                        className="flex-1"
                    />
                </div>
            )}

            {/* Gradient Preview Bar with Draggable Stops */}
            <div
                ref={barRef}
                className="h-6 rounded-lg border border-white/20 relative select-none"
                style={{ backgroundImage: cssGradient }}
            >
                {value.stops.map((stop, index) => (
                    <div
                        key={`${stop.color}-${stop.position}-${index}`}
                        className="absolute"
                        style={{
                            left: `calc(${stop.position}% - 12px)`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: draggingStop === index ? 10 : 1
                        }}
                    >
                        {/* Hidden color input */}
                        <input
                            ref={(el) => { colorInputRefs.current[index] = el }}
                            type="color"
                            value={stop.color}
                            onChange={(e) => handleStopColorChange(index, e.target.value)}
                            className="absolute opacity-0 w-0 h-0 pointer-events-none"
                        />
                        {/* Visible handle */}
                        <button
                            className={cn(
                                "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                                "border-white/80 shadow-lg",
                                draggingStop === index ? "scale-125 cursor-grabbing" : "cursor-pointer"
                            )}
                            style={{ backgroundColor: stop.color }}
                            onMouseDown={(e) => handleStopMouseDown(index, e)}
                            onClick={(e) => handleStopClick(index, e)}
                            onContextMenu={(e) => {
                                e.preventDefault()
                                handleDeleteStop(index)
                            }}
                            title="Double-click for color • Drag to move • Right-click to delete"
                        />
                    </div>
                ))}
            </div>

            {/* Add Stop Button */}
            <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] text-zinc-500">Stops: {value.stops.length}</Label>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAddStop}
                    className="h-6 px-2 text-[10px]"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Stop
                </Button>
            </div>

            {/* Preview Text */}
            <div className="p-2.5 rounded-lg border border-white/10 bg-black/40 text-center">
                <div
                    className="text-lg font-bold"
                    style={{
                        backgroundImage: cssGradient,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent'
                    }}
                >
                    Preview Text
                </div>
            </div>
        </div>
    )
}
