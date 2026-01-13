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
        <div className="h-[320px] w-full perspective-1000 group">
            <motion.div
                className="relative w-full h-full transition-all duration-500 transform-style-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, animationDirection: "normal" }}
                onAnimationComplete={() => setIsAnimating(false)}
            >
                {/* FRONT FACE */}
                <Card className="absolute inset-0 w-full h-full backface-hidden bg-white/5 border-white/10 backdrop-blur-sm flex flex-col justify-between">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                            {/* Render the passed node */}
                            {icon}
                        </div>
                        <CardTitle className="font-heading text-xl">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                            {desc}
                        </p>
                        <Button
                            variant="link"
                            className="p-0 h-auto text-accent hover:text-white transition-colors"
                            onClick={handleFlip}
                        >
                            Learn more &rarr;
                        </Button>
                    </CardContent>
                </Card>

                {/* BACK FACE */}
                <Card className="absolute inset-0 w-full h-full backface-hidden bg-accent/10 border-accent/30 backdrop-blur-md flex flex-col rotate-y-180">
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
