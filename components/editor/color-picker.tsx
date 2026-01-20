"use client"

import * as React from "react"
import { Check, Pipette, Palette, Save, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GradientPicker } from "./gradient-picker"
import { GradientConfig, gradientToCSS, cssToGradient } from "@/lib/utils/gradient-utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const TEXT_PRESETS = [
    { name: "Accent", class: "bg-accent border-accent/20", value: "#0c759a" },
    { name: "White", class: "bg-white border-white/20", value: "#ffffff" },
    { name: "Zinc-400", class: "bg-zinc-400 border-zinc-500/20", value: "#a1a1aa" },
    { name: "Red", class: "bg-red-500 border-red-600/20", value: "#ef4444" },
    { name: "Blue", class: "bg-blue-500 border-blue-600/20", value: "#3b82f6" },
    { name: "Emerald", class: "bg-emerald-500 border-emerald-600/20", value: "#10b981" },
]

const BG_PRESETS = [
    { name: 'Transparent', class: 'bg-transparent border-white/10', value: 'transparent' },
    { name: 'White / Low', class: 'bg-white/10 border-white/20', value: 'rgba(255,255,255,0.1)' },
    { name: 'White', class: 'bg-white border-white/20', value: '#ffffff' },
    { name: 'Black', class: 'bg-black border-white/10', value: '#000000' },
    { name: 'Dark Blue', class: 'bg-[#0f172a] border-zinc-800', value: '#0f172a' },
    { name: 'Blue', class: 'bg-[#3b82f6] border-blue-400/20', value: '#3b82f6' },
    { name: 'Purple', class: 'bg-[#8b5cf6] border-purple-400/20', value: '#8b5cf6' },
]

interface ColorPickerProps {
    value?: string
    onChange: (value: string) => void
    type?: 'text' | 'background'
    customPresets?: { name: string, class: string, value: string }[]
}

type ColorPreset = {
    id: string
    name: string
    type: 'solid' | 'linear' | 'radial'
    value: string
    is_default: boolean
}

export function ColorPicker({ value, onChange, type = 'text', customPresets }: ColorPickerProps) {
    const hardcodedPresets = customPresets || (type === 'text' ? TEXT_PRESETS : BG_PRESETS)

    // Simple mode detection
    const [mode, setMode] = React.useState<'solid' | 'gradient'>(() => {
        return value?.includes('gradient') ? 'gradient' : 'solid'
    })

    const [localHex, setLocalHex] = React.useState(() => {
        return value?.startsWith('#') ? value : "#ffffff"
    })

    const [gradientConfig, setGradientConfig] = React.useState<GradientConfig>(() => {
        if (value?.includes('gradient')) {
            const parsed = cssToGradient(value)
            if (parsed) return parsed
        }
        return {
            type: 'linear',
            angle: 180,
            stops: [
                { color: '#ffffff', position: 0 },
                { color: '#9ca3af', position: 100 }
            ]
        }
    })

    // Update gradient config when value changes (to sync with selected text)
    React.useEffect(() => {
        console.log('[ColorPicker] value prop:', value)
        if (value?.includes('gradient')) {
            const parsed = cssToGradient(value)
            console.log('[ColorPicker] parsed gradient:', parsed)
            if (parsed) {
                setGradientConfig(parsed)
            }
        }
    }, [value])

    const [dbPresets, setDbPresets] = React.useState<ColorPreset[]>([])
    const [presetToDelete, setPresetToDelete] = React.useState<string | null>(null)

    React.useEffect(() => {
        fetchPresets()
    }, [])

    const fetchPresets = async () => {
        try {
            const res = await fetch('/api/presets')
            const data = await res.json()
            setDbPresets(data.presets || [])
        } catch (err) {
            console.error('Failed to fetch presets:', err)
        }
    }

    const handleSavePreset = async () => {
        const colorValue = mode === 'solid' ? localHex : gradientToCSS(gradientConfig)
        const presetType = mode === 'solid' ? 'solid' : gradientConfig.type

        const customCount = dbPresets.filter(p => !p.is_default).length
        const name = `Gradient ${customCount + 1}`

        try {
            const res = await fetch('/api/presets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type: presetType, value: colorValue })
            })

            if (res.ok) {
                await fetchPresets()
            } else {
                const error = await res.json()
                alert(error.error)
            }
        } catch (err) {
            console.error('Failed to save preset:', err)
        }
    }

    const handleDeletePreset = async (id: string) => {
        try {
            await fetch(`/api/presets/${id}`, { method: 'DELETE' })
            await fetchPresets()
            setPresetToDelete(null)
        } catch (err) {
            console.error('Failed to delete preset:', err)
        }
    }

    const handleGradientChange = (config: GradientConfig) => {
        setGradientConfig(config)
        onChange(gradientToCSS(config))
    }

    const handleSolidChange = (newColor: string) => {
        setLocalHex(newColor)
        onChange(newColor)
    }

    const customPresetsCount = dbPresets.filter(p => !p.is_default).length

    return (
        <div className="space-y-3 min-w-[280px]">
            {/* Mode Tabs */}
            <div className="flex gap-1 p-0.5 bg-white/5 rounded-lg">
                <Button
                    size="sm"
                    variant={mode === 'solid' ? 'default' : 'ghost'}
                    onClick={() => setMode('solid')}
                    className="flex-1 h-7"
                >
                    <Pipette className="w-3 h-3 mr-1" />
                    Solid
                </Button>
                <Button
                    size="sm"
                    variant={mode === 'gradient' ? 'default' : 'ghost'}
                    onClick={() => setMode('gradient')}
                    className="flex-1 h-7"
                >
                    <Palette className="w-3 h-3 mr-1" />
                    Gradient
                </Button>
            </div>

            {/* Solid Mode */}
            {mode === 'solid' && (
                <div className="flex flex-wrap items-center gap-1.5 p-1">
                    {hardcodedPresets.map((color) => {
                        const isActive = value === color.value
                        return (
                            <button
                                key={color.value}
                                onClick={() => onChange(color.value)}
                                className={cn(
                                    "w-6 h-6 rounded-full border transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative overflow-hidden",
                                    color.class,
                                    isActive && "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110 z-10"
                                )}
                                title={color.name}
                            >
                                {color.value === 'transparent' && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-full h-px bg-red-500/50 rotate-45" />
                                        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/checkerboard-cross-light.png')] opacity-10" />
                                    </div>
                                )}
                                {isActive && <Check className={cn("w-3 h-3 z-20", (color.value === '#ffffff' || color.value === 'transparent') ? "text-zinc-950" : "text-white")} />}
                            </button>
                        )
                    })}

                    <div className="h-6 w-px bg-white/10 mx-0.5" />

                    {/* Custom Color Wheel */}
                    <div className="relative w-6 h-6 group overflow-hidden rounded-full">
                        <input
                            type="color"
                            value={localHex}
                            onChange={(e) => handleSolidChange(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={cn(
                            "w-full h-full border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 rounded-full",
                            value?.startsWith('#') ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : "bg-gradient-to-tr from-red-500 via-green-500 to-blue-500"
                        )} style={value?.startsWith('#') ? { backgroundColor: value } : {}}>
                            <Pipette className={cn("w-3 h-3 z-10", value?.startsWith('#') ? "text-white mix-blend-difference" : "text-white")} />
                        </div>
                    </div>
                </div>
            )}

            {/* Gradient Mode */}
            {mode === 'gradient' && (
                <GradientPicker
                    value={gradientConfig}
                    onChange={handleGradientChange}
                />
            )}

            {/* Database Presets - Only in Gradient mode */}
            {mode === 'gradient' && dbPresets.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            Presets ({customPresetsCount}/5)
                        </p>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSavePreset}
                            disabled={customPresetsCount >= 5}
                            className="h-6 px-2 text-[10px]"
                        >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                        </Button>
                    </div>

                    {/* Circular preset buttons matching solid colors */}
                    <div className="flex flex-wrap gap-1.5 p-1">
                        {dbPresets.map((preset) => {
                            const isActive = value === preset.value
                            return (
                                <div key={preset.id} className="relative group">
                                    <button
                                        onClick={() => onChange(preset.value)}
                                        onContextMenu={(e) => {
                                            if (!preset.is_default) {
                                                e.preventDefault()
                                                setPresetToDelete(preset.id)
                                            }
                                        }}
                                        className={cn(
                                            "w-6 h-6 rounded-full border transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative overflow-hidden",
                                            "border-white/10",
                                            isActive && "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110 z-10"
                                        )}
                                        style={{ backgroundImage: preset.value }}
                                        title={preset.name}
                                    >
                                        {isActive && <Check className="w-3 h-3 z-20 text-white mix-blend-difference" />}
                                    </button>
                                    {/* Delete button for custom presets */}
                                    {!preset.is_default && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setPresetToDelete(preset.id)
                                            }}
                                            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <Trash2 className="w-2 h-2 text-white" />
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={presetToDelete !== null} onOpenChange={() => setPresetToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Preset?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => presetToDelete && handleDeletePreset(presetToDelete)}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
