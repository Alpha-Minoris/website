'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Bot, Zap, Brain, Sparkles, Terminal, Code, Cpu, Globe } from 'lucide-react'

const LOGOS = [
    { name: 'OpenAI', icon: Brain },
    { name: 'Anthropic', icon: Sparkles },
    { name: 'Zapier', icon: Zap },
    { name: 'N8n', icon: Terminal },
    { name: 'Midjourney', icon: Bot },
    { name: 'Gemini', icon: Code },
    { name: 'HuggingFace', icon: Cpu },
    { name: 'Vercel', icon: Globe },
]

function LogoRow({ direction = 'left', speed = 20, row }: { direction?: 'left' | 'right', speed?: number, row: number }) {
    return (
        <div className="flex overflow-hidden relative z-0 opacity-20 hover:opacity-40 transition-opacity duration-500">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />

            <motion.div
                className="flex gap-16 min-w-full shrink-0 items-center justify-around py-4"
                animate={{ x: direction === 'left' ? '-100%' : '100%' }}
                transition={{
                    ease: 'linear',
                    duration: speed,
                    repeat: Infinity,
                    repeatType: "loop"
                }}
                initial={{ x: 0 }}
                style={{ x: direction === 'left' ? 0 : '-100%' }} // Start offset for right scroll
            >
                {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, idx) => (
                    <div key={`${row}-${idx}`} className="flex items-center gap-2 group">
                        <logo.icon className="w-8 h-8 text-white group-hover:text-accent transition-colors" />
                        <span className="text-xl font-heading font-bold text-transparent group-hover:text-white transition-colors uppercase tracking-widest bg-clip-text bg-gradient-to-r from-white/50 to-white/10 select-none">
                            {logo.name}
                        </span>
                    </div>
                ))}
            </motion.div>

            {/* Duplicate for seamless loop */}
            <motion.div
                className="flex gap-16 min-w-full shrink-0 items-center justify-around py-4"
                animate={{ x: direction === 'left' ? '-100%' : '100%' }}
                transition={{
                    ease: 'linear',
                    duration: speed,
                    repeat: Infinity,
                    repeatType: "loop"
                }}
                initial={{ x: 0 }}
                style={{ x: direction === 'left' ? 0 : '-100%' }}
            >
                {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, idx) => (
                    <div key={`${row}-dup-${idx}`} className="flex items-center gap-2 group">
                        <logo.icon className="w-8 h-8 text-white group-hover:text-accent transition-colors" />
                        <span className="text-xl font-heading font-bold text-transparent group-hover:text-white transition-colors uppercase tracking-widest bg-clip-text bg-gradient-to-r from-white/50 to-white/10 select-none">
                            {logo.name}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

export function LogoRibbon() {
    return (
        <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none flex flex-col gap-4 pb-10">
            <LogoRow direction="left" speed={40} row={1} />
            <LogoRow direction="right" speed={50} row={2} />
            <LogoRow direction="left" speed={45} row={3} />
        </div>
    )
}
