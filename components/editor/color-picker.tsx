"use client"

import * as React from "react"
import { Check, Pipette } from "lucide-react"
import { cn } from "@/lib/utils"

const THEME_COLORS = [
    { name: "Accent", class: "bg-accent border-accent/20", value: "text-accent" },
    { name: "White", class: "bg-white border-white/20", value: "text-white" },
    { name: "Zinc-400", class: "bg-zinc-400 border-zinc-500/20", value: "text-zinc-400" },
    { name: "Red", class: "bg-red-500 border-red-600/20", value: "text-red-500" },
    { name: "Blue", class: "bg-blue-500 border-blue-600/20", value: "text-blue-500" },
    { name: "Emerald", class: "bg-emerald-500 border-emerald-600/20", value: "text-emerald-500" },
]

interface ColorPickerProps {
    value?: string
    onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    // Check if current value is a hex color
    const isHex = value?.startsWith('#')

    // Local state for the input to make it smooth
    const [localHex, setLocalHex] = React.useState(isHex ? value : "#ffffff")

    // Synchronize local state when incoming value changes (but not when we're the ones changing it)
    React.useEffect(() => {
        if (isHex && value !== localHex) {
            setLocalHex(value)
        }
    }, [value, isHex])

    return (
        <div className="flex flex-wrap items-center gap-1.5 p-1">
            {THEME_COLORS.map((color) => (
                <button
                    key={color.value}
                    onClick={() => onChange(color.value)}
                    className={cn(
                        "w-6 h-6 rounded-full border transition-all hover:scale-110 active:scale-95 flex items-center justify-center",
                        color.class,
                        value === color.value && "ring-2 ring-white ring-offset-2 ring-offset-zinc-950"
                    )}
                    title={color.name}
                >
                    {value === color.value && <Check className="w-3 h-3 text-zinc-950" />}
                </button>
            ))}

            <div className="h-6 w-px bg-white/10 mx-0.5" />

            {/* Custom Color Wheel */}
            <div className="relative w-6 h-6 group overflow-hidden rounded-full">
                <input
                    type="color"
                    value={localHex}
                    onChange={(e) => {
                        const newVal = e.target.value
                        setLocalHex(newVal)
                    }}
                    onBlur={() => {
                        // Commit the final value on blur
                        if (localHex && localHex !== value) {
                            onChange(localHex)
                        }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={cn(
                    "w-full h-full border border-white/10 flex items-center justify-center transition-all group-hover:scale-110",
                    isHex ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : "bg-gradient-to-tr from-red-500 via-green-500 to-blue-500"
                )} style={isHex ? { backgroundColor: localHex } : {}}>
                    <Pipette className={cn("w-3 h-3", isHex ? "text-white mix-blend-difference" : "text-white")} />
                </div>
            </div>
        </div>
    )
}
