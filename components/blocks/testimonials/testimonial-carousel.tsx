'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Testimonial {
    id: string
    quote: string
    name: string
    role: string
    company: string
}

interface TestimonialCarouselProps {
    testimonials: Testimonial[]
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
    const [items, setItems] = useState(testimonials)
    const [direction, setDirection] = useState(0)

    const rotateLeft = () => {
        if (items.length <= 1) return
        setDirection(-1)
        setItems((prev) => {
            const newArr = [...prev]
            const last = newArr.pop()!
            newArr.unshift(last)
            return newArr
        })
    }

    const rotateRight = () => {
        if (items.length <= 1) return
        setDirection(1)
        setItems((prev) => {
            const newArr = [...prev]
            const first = newArr.shift()!
            newArr.push(first)
            return newArr
        })
    }

    if (items.length === 0) return null

    return (
        <div className="relative w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">

            {/* Left Arrow Button - Desktop */}
            <button
                onClick={rotateLeft}
                disabled={items.length <= 1}
                className="hidden md:flex w-14 h-14 md:w-16 md:h-16 shrink-0 items-center justify-center rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/20 text-white/60 hover:text-white disabled:opacity-20 transition-all duration-300 group"
            >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Cards Stack */}
            <div className="relative w-full max-w-2xl h-[340px] md:h-[340px] order-1 md:order-none">
                <AnimatePresence initial={false} mode="popLayout">
                    {items.slice(0, 3).map((t, index) => {
                        const isFront = index === 0
                        const scale = 1 - index * 0.03
                        const yOffset = index * 10
                        const zIndex = 30 - index * 10

                        return (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{
                                    scale,
                                    y: yOffset,
                                    zIndex,
                                    opacity: 1
                                }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 35,
                                    opacity: { duration: 0.2 }
                                }}
                                className="absolute top-0 left-0 right-0"
                            >
                                <div className={`
                                    bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl 
                                    p-6 md:p-10 rounded-3xl shadow-2xl 
                                    min-h-[320px] md:min-h-[320px] 
                                    flex flex-col justify-center relative overflow-hidden
                                `}>
                                    {/* Inner glow */}
                                    <div className="absolute -inset-4 bg-accent/5 blur-3xl rounded-full pointer-events-none" />

                                    {/* Quote icon */}
                                    <Quote className="absolute top-6 left-8 w-8 h-8 text-accent/15" />

                                    <div className="relative z-10 space-y-6 text-center px-4 md:px-10">
                                        <p className="text-base md:text-xl lg:text-2xl font-medium text-white/90 leading-relaxed">
                                            "{t.quote}"
                                        </p>

                                        <div className="flex flex-col items-center gap-3 pt-2">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent font-semibold text-base border border-accent/20">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white text-base">{t.name}</div>
                                                <div className="text-sm text-white/50 uppercase tracking-wider">
                                                    {t.role} · {t.company}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Right Arrow Button - Desktop */}
            <button
                onClick={rotateRight}
                disabled={items.length <= 1}
                className="hidden md:flex w-14 h-14 md:w-16 md:h-16 shrink-0 items-center justify-center rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/20 text-white/60 hover:text-white disabled:opacity-20 transition-all duration-300 group"
            >
                <ArrowRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Navigation Controls */}
            <div className="flex md:hidden items-center gap-4 mt-4 order-2">
                <button
                    onClick={rotateLeft}
                    disabled={items.length <= 1}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl text-white/60 disabled:opacity-20 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={rotateRight}
                    disabled={items.length <= 1}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl text-white/60 disabled:opacity-20 transition-all"
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
