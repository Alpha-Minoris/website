'use client'

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
                                <img
                                    src={logo.asset.value}
                                    alt={logo.name}
                                    className="w-8 h-8 object-contain"
                                />
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

    return (
        <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none flex flex-col gap-2 pb-12 overflow-hidden mask-vertical">
            <LogoRow direction="left" speed={60} row={1} logos={activeLogos} />
            <LogoRow direction="right" speed={80} row={2} logos={activeLogos} />
            <LogoRow direction="left" speed={70} row={3} logos={activeLogos} />
        </div>
    )
}
