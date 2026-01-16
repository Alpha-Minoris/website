'use client'

import { useRef, useState, MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TiltCardProps {
    children: React.ReactNode
    className?: string
}

export function TiltCard({ children, className }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [rotation, setRotation] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5

        const rotateX = yPct * -25 // Max rotation X deg (increased)
        const rotateY = xPct * 25  // Max rotation Y deg (increased)

        setRotation({ x: rotateX, y: rotateY })
    }

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 })
    }

    return (
        <motion.div
            ref={ref}
            className={cn("relative transition-transform ease-out", className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
                rotateX: rotation.x,
                rotateY: rotation.y,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.5
            }}
            style={{
                transformStyle: "preserve-3d",
            }}
        >
            <div style={{ transform: "translateZ(50px)" }}></div> {/* Optional depth helper if needed, but child content is enough */}
            {children}
        </motion.div>
    )
}
