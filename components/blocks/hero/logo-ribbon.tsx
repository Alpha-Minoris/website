'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { IconDisplay } from '@/components/blocks/icon-block'

interface LogoItem {
    name: string
    asset: { type: 'icon' | 'image', value: string }
}

interface LogoRowProps {
    direction?: 'left' | 'right'
    speed?: number
    row: number
    logos: LogoItem[]
}

function LogoRow({ direction = 'left', speed = 60, row, logos }: LogoRowProps) {
    if (!logos || logos.length === 0) return null

    // Triplicate to ensure enough width for seamless looping
    const displayLogos = [...logos, ...logos, ...logos]

    return (
        <div className="flex overflow-hidden relative z-0 opacity-20 hover:opacity-40 transition-opacity duration-500 py-2">

            <motion.div
                className="flex gap-24 shrink-0 items-center justify-around pr-24"
                animate={{ x: direction === 'left' ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
                transition={{
                    ease: 'linear',
                    duration: speed,
                    repeat: Infinity,
                    repeatType: "loop"
                }}
            >
                {displayLogos.map((logo, idx) => (
                    <div key={`${row}-${idx}`} className="flex items-center gap-3 group whitespace-nowrap">
                        <div className="w-8 h-8 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100">
                            {logo.asset.type === 'icon' ? (
                                <IconDisplay name={logo.asset.value} className="w-8 h-8 text-white group-hover:text-accent transition-colors" />
                            ) : (
                                logo.asset.value ? (
                                    <img
                                        src={logo.asset.value}
                                        alt={logo.name}
                                        className="w-8 h-8 object-contain"
                                    />
                                ) : (
                                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded border border-white/10">
                                        <IconDisplay name="Image" className="w-4 h-4 text-zinc-600" />
                                    </div>
                                )
                            )}
                        </div>
                        <span className="text-xl font-heading font-bold text-transparent group-hover:text-white transition-colors uppercase tracking-[0.2em] bg-clip-text bg-gradient-to-r from-white/40 to-white/10 select-none">
                            {logo.name}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

interface LogoRibbonProps {
    logos?: LogoItem[]
}

export function LogoRibbon({ logos = [] }: LogoRibbonProps) {
    const defaultLogos: LogoItem[] = [
        { name: 'OpenAI', asset: { type: 'icon', value: 'Brain' } },
        { name: 'Anthropic', asset: { type: 'icon', value: 'Sparkles' } },
        { name: 'Zapier', asset: { type: 'icon', value: 'Zap' } },
        { name: 'N8n', asset: { type: 'icon', value: 'Terminal' } },
        { name: 'Midjourney', asset: { type: 'icon', value: 'Bot' } },
        { name: 'Gemini', asset: { type: 'icon', value: 'Code' } },
        { name: 'HuggingFace', asset: { type: 'icon', value: 'Cpu' } },
        { name: 'Vercel', asset: { type: 'icon', value: 'Globe' } },
    ]

    const activeLogos = logos.length > 0 ? logos : defaultLogos

    // State to hold randomized/shuffled data to prevent hydration mismatch
    const [rowConfigs, setRowConfigs] = useState<{ logos: LogoItem[], speed: number, direction: 'left' | 'right' }[]>([])

    useEffect(() => {
        const shuffleArray = (array: LogoItem[]) => {
            const newArray = [...array]
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
            }
            return newArray
        }

        const shuffledMaster = shuffleArray(activeLogos)

        // Chunk logos into 3 groups
        const total = shuffledMaster.length
        const chunkSize = Math.ceil(total / 3)

        const chunks = [
            shuffledMaster.slice(0, chunkSize),
            shuffledMaster.slice(chunkSize, chunkSize * 2),
            shuffledMaster.slice(chunkSize * 2)
        ]

        // Randomize speeds (capped at current speeds, which means duration >= baseline)
        setRowConfigs([
            {
                logos: chunks[0],
                speed: 60 + Math.random() * 20,
                direction: 'left'
            },
            {
                logos: chunks[1],
                speed: 80 + Math.random() * 30,
                direction: 'right'
            },
            {
                logos: chunks[2],
                speed: 70 + Math.random() * 20,
                direction: 'left'
            }
        ])
    }, [activeLogos])

    if (rowConfigs.length === 0) return null

    return (
        <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none flex flex-col gap-2 pb-12 overflow-hidden mask-vertical">
            {rowConfigs.map((config: any, idx: number) => (
                <LogoRow
                    key={idx}
                    direction={config.direction}
                    speed={config.speed}
                    row={idx + 1}
                    logos={config.logos}
                />
            ))}
        </div>
    )
}
