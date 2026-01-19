'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Search, PenTool, Cpu, Building2, Sparkles, Network, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface Stage {
    id: string
    title: string
    icon: LucideIcon
    description: string
    color: string
    accentColor: string // CSS compatible color
}

const stages: Stage[] = [
    {
        id: 'assessment',
        title: 'Cognitive Audit',
        icon: Search,
        description: 'Deep-dive analysis of your operational architecture to pinpoint high-impact AI integration vectors.',
        color: 'text-blue-400',
        accentColor: '#3b82f6'
    },
    {
        id: 'implementation',
        title: 'Neural Architecture',
        icon: Network,
        description: 'Engineering bespoke intelligent systems designed to amplify human capability, not just automate it.',
        color: 'text-purple-400',
        accentColor: '#a855f7'
    },
    {
        id: 'core',
        title: 'Core Fusion',
        icon: Zap,
        description: 'Embedding a sovereign AI engine into your company DNA, creating a self-evolving competitive advantage.',
        color: 'text-accent',
        accentColor: 'hsl(var(--accent))'
    }
]

export function MissionAnimation() {
    const [activeStage, setActiveStage] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % stages.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="relative w-full h-[550px] flex flex-col items-center justify-between py-12 px-8 overflow-hidden bg-black/40">
            {/* Ultra-Premium Background: Ethereal Gradients */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        opacity: [0.1, 0.15, 0.1],
                        scale: [1, 1.1, 1],
                        rotate: [0, 90, 180],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-accent/20 via-transparent to-transparent blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        opacity: [0.05, 0.1, 0.05],
                        scale: [1.2, 1, 1.2],
                        rotate: [180, 270, 360],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-transparent blur-[120px] rounded-full"
                />
            </div>

            {/* Stage Indicators: The "Synaptic Bridge" */}
            <div className="relative w-full max-w-2xl px-4 mt-8">
                {/* Connecting Path (Surgical Alignment) */}
                <div className="absolute top-8 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <svg className="absolute top-0 left-0 w-full h-16 overflow-visible pointer-events-none z-0">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Active Progress Line */}
                    <motion.line
                        x1="0"
                        y1="32"
                        x2="100%"
                        y2="32"
                        stroke="rgba(255,255,255,0.02)"
                        strokeWidth="1"
                    />

                    {/* Flowing Pulse (Elegant Synaptic Flow) */}
                    <motion.path
                        d="M -100 32 L 1200 32"
                        fill="none"
                        stroke="url(#pulse-gradient)"
                        strokeWidth="1.5"
                        strokeDasharray="50 300"
                        animate={{ x: [-500, 500] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        filter="url(#glow)"
                    />

                    <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor={stages[activeStage].accentColor} />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </svg>

                {/* Hubs / Nodes */}
                <div className="relative flex justify-between items-start z-10 w-full">
                    {stages.map((stage, index) => {
                        const isActive = activeStage === index
                        const Icon = stage.icon

                        return (
                            <div key={stage.id} className="flex flex-col items-center w-32 group">
                                {/* Hub Circle */}
                                <div className="relative">
                                    <motion.div
                                        animate={{
                                            borderColor: isActive ? stage.accentColor : 'rgba(255,255,255,0.08)',
                                            backgroundColor: isActive ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.2)',
                                            scale: isActive ? 1.1 : 1,
                                            boxShadow: isActive ? `0 0 40px ${stage.accentColor}33` : '0 0 0px transparent'
                                        }}
                                        className={cn(
                                            "w-16 h-16 rounded-full border-[1.5px] flex items-center justify-center backdrop-blur-2xl transition-all duration-700",
                                            "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/5 before:to-transparent"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "w-7 h-7 transition-all duration-700",
                                            isActive ? stage.color : "text-zinc-600 group-hover:text-zinc-400"
                                        )} />
                                    </motion.div>

                                    {/* Orbital Ring */}
                                    {isActive && (
                                        <motion.div
                                            initial={{ rotate: 0 }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                            className="absolute -inset-2 border-t border-r border-accent/20 rounded-full"
                                        />
                                    )}
                                </div>

                                {/* Hub Label */}
                                <motion.div
                                    animate={{
                                        opacity: isActive ? 1 : 0.3,
                                        y: isActive ? 16 : 8
                                    }}
                                    className="text-center"
                                >
                                    <h5 className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700",
                                        isActive ? "text-white" : "text-zinc-500"
                                    )}>
                                        {stage.title}
                                    </h5>
                                </motion.div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Central Narrative: The Transitioning Logic */}
            <div className="relative w-full max-w-xl flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStage}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.02, y: -10 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center space-y-4"
                    >
                        <p className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed max-w-md mx-auto italic">
                            "{stages[activeStage].description}"
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-accent/40" />
                            <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 px-3 py-1 rounded-full">
                                <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                                <span className="text-[10px] text-accent font-bold uppercase tracking-widest leading-none">
                                    PHASE {activeStage + 1} System Integration
                                </span>
                            </div>
                            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-accent/40" />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Final Outcome Visualization (The百万豪宅/Million Dollar Outcome) */}
            <div className="relative pt-8 w-full max-w-xs h-32 flex items-center justify-center">
                <div className="relative flex items-center gap-6 px-10 py-6 bg-black/40 border border-white/5 rounded-3xl backdrop-blur-3xl overflow-hidden shadow-2xl">
                    {/* Perspective Grid Background */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />

                    <Building2 className="w-10 h-10 text-zinc-800 relative z-10" />

                    {/* The Evolving Core (No Overlap, Precise Layering) */}
                    <div className="relative w-14 h-14 flex items-center justify-center z-10">
                        {/* Wireframe Shield */}
                        <motion.div
                            animate={{ rotate: activeStage === 2 ? 360 : 0, opacity: activeStage === 2 ? 0.3 : 0.05 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border border-white/20 rounded-xl rotate-45"
                        />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStage}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.6, ease: "anticipate" }}
                                className="relative flex items-center justify-center"
                            >
                                {activeStage === 0 && <div className="w-3 h-3 rounded-full bg-blue-500/40 border border-blue-500/60 blur-[1px] animate-pulse" />}
                                {activeStage === 1 && (
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-4 bg-purple-500/40 rounded-full blur-[0.5px]" />
                                        <div className="w-1.5 h-4 bg-purple-500/40 rounded-full mt-2 blur-[0.5px]" />
                                    </div>
                                )}
                                {activeStage === 2 && (
                                    <div className="relative flex items-center justify-center">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Cpu className="w-10 h-10 text-accent drop-shadow-[0_0_15px_rgba(12,117,154,0.6)]" />
                                        </motion.div>
                                        <motion.div
                                            animate={{ opacity: [0, 0.2, 0], scale: [1, 2, 1] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="absolute -inset-4 bg-accent/30 blur-2xl rounded-full"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col gap-0.5 relative z-10">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Asset Grade</span>
                        <motion.span
                            animate={{
                                color: activeStage === 2 ? '#0c759a' : '#3f3f46',
                                textShadow: activeStage === 2 ? '0 0 20px rgba(12,117,154,0.3)' : 'none'
                            }}
                            className="text-sm font-black uppercase tracking-wider"
                        >
                            {activeStage === 2 ? 'AI-Liquid' : 'Legacy Cap'}
                        </motion.span>
                    </div>
                </div>
            </div>

            {/* Subtle Aesthetic Footnote */}
            <div className="absolute bottom-4 text-[8px] text-zinc-800 uppercase tracking-[0.5em] font-medium">
                Proprietary Alpha Minoris Transformation Pipeline
            </div>
        </div>
    )
}
