'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
    // If we have items, we want to cycle them.
    // We treat index 0 as the "front" card.
    const [items, setItems] = useState(testimonials)

    const rotateLeft = () => {
        if (items.length <= 1) return
        setItems((prev) => {
            const newArr = [...prev]
            const last = newArr.pop()!
            newArr.unshift(last) // Move last to first
            return newArr
        })
    }

    const rotateRight = () => {
        if (items.length <= 1) return
        setItems((prev) => {
            const newArr = [...prev]
            const first = newArr.shift()!
            newArr.push(first) // Move first to last
            return newArr
        })
    }

    if (items.length === 0) return null

    // We only display the top few cards for the "stack" effect
    // But we render them in reverse order so the first item is on top (highest z-index)
    const visibleItems = items.slice(0, 3).reverse()

    return (
        <div className="relative w-full max-w-4xl mx-auto h-[400px] flex items-center justify-center perspective-1000">

            {/* Cards Stack */}
            <div className="relative w-full max-w-2xl h-64 md:h-80">
                <AnimatePresence mode="popLayout">
                    {items.map((t, index) => {
                        // Only process the first 3 items for performance/visuals
                        if (index > 2) return null

                        // index 0 is active (front)
                        // index 1 is behind
                        // index 2 is further behind
                        const isFront = index === 0
                        const scale = 1 - index * 0.05
                        const yOffset = index * 15 // pixels down
                        const zIndex = 30 - index * 10
                        const opacity = 1 - index * 0.2

                        return (
                            <motion.div
                                key={t.id}
                                layout
                                initial={false}
                                animate={{
                                    scale,
                                    y: yOffset,
                                    zIndex,
                                    opacity
                                }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="absolute top-0 left-0 right-0"
                            >
                                <Card className="bg-white/5 border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-xl min-h-[300px] flex flex-col justify-center relative overflow-hidden">
                                    {/* Decorative quote */}
                                    <Quote className="absolute top-6 left-8 w-12 h-12 text-accent/10" />

                                    <div className="relative z-10 space-y-6 text-center px-4 md:px-12">
                                        <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed font-heading">
                                            "{t.quote}"
                                        </p>

                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg border border-accent/20">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg">{t.name}</div>
                                                <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                                                    {t.role}, {t.company}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="absolute -bottom-12 md:bottom-auto md:-right-16 flex md:flex-col gap-4 z-40">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={rotateLeft}
                    disabled={items.length <= 1}
                    className="w-12 h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={rotateRight}
                    disabled={items.length <= 1}
                    className="w-12 h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
                >
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>
        </div>
    )
}
