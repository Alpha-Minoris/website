'use client'

import { useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle } from 'lucide-react'

type ServiceCardProps = {
    title: string
    desc: string
    details: string[]
    icon: ReactNode
}

export function ServiceFlipCard({ title, desc, details, icon }: ServiceCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    const handleFlip = () => {
        if (!isAnimating) {
            setIsFlipped(!isFlipped)
            setIsAnimating(true)
        }
    }

    return (
        <div className="h-[420px] w-full perspective-1000 group">
            <motion.div
                className="relative w-full h-full transition-all duration-500 transform-style-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                onAnimationComplete={() => setIsAnimating(false)}
            >
                {/* FRONT FACE */}
                <Card className="absolute inset-0 w-full h-full backface-hidden bg-white/5 border-white/10 overflow-hidden group hover:border-accent/40 transition-colors flex flex-col justify-between">
                    <div className="h-48 bg-white/5 relative group-hover:bg-white/10 transition-colors flex items-center justify-center border-b border-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            {/* Render the passed node */}
                            {icon}
                        </div>
                    </div>

                    <CardContent className="flex-1 pt-6 text-center space-y-2 px-6">
                        <CardTitle className="font-heading text-xl text-white group-hover:text-accent transition-colors">{title}</CardTitle>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                            {desc}
                        </p>
                    </CardContent>

                    <div className="pb-6 text-center">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-accent text-xs uppercase tracking-widest font-bold hover:text-white transition-colors"
                            onClick={handleFlip}
                        >
                            View Details
                        </Button>
                    </div>
                </Card>

                {/* BACK FACE */}
                <Card className="absolute inset-0 w-full h-full backface-hidden bg-zinc-900 border-accent/40 flex flex-col rotate-y-180 overflow-hidden">
                    <CardContent className="flex flex-col h-full pt-6">
                        <div className="flex-1 space-y-3">
                            <h4 className="font-bold text-white mb-2">Key Features</h4>
                            <ul className="space-y-2">
                                {details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-white/80">
                                        <CheckCircle className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="self-start mt-4 text-white hover:bg-white/10 gap-2"
                            onClick={handleFlip}
                        >
                            <ArrowLeft className="w-4 h-4" /> Go Back
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
