'use client'

import { useEffect, useRef, useState } from 'react'

interface EnergyCloud {
    worldX: number
    worldY: number
    radius: number
    vx: number
    vy: number
    color: string
    phaseX: number
    phaseY: number
    sizePhase: number
}

export function SynapticBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const clouds = useRef<EnergyCloud[]>([])
    const scrollY = useRef(0)
    const time = useRef(0)
    const [opacity, setOpacity] = useState(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrame: number
        const colors = {
            bg: '#02040a', // DEEP DARK BASE (Pushed into distance)
            blue: 'rgba(76, 201, 240, 0.12)', // Subtle Blue preeminence
            teal: 'rgba(12, 235, 185, 0.05)', // Ethereal Teal
            purple: 'rgba(157, 78, 221, 0.05)' // Ethereal Purple
        }

        const resize = () => {
            const dpr = window.devicePixelRatio || 1
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            ctx.scale(dpr, dpr)

            const worldHeight = Math.max(document.body.scrollHeight, window.innerHeight * 4)
            clouds.current = []

            // Generate extremely broad, distant washes
            for (let i = 0; i < 18; i++) {
                let color = colors.blue
                if (i % 8 >= 6) {
                    color = (i % 2 === 0) ? colors.teal : colors.purple
                }

                clouds.current.push({
                    worldX: Math.random() * window.innerWidth,
                    worldY: Math.random() * worldHeight,
                    radius: 1600 + Math.random() * 1200, // MASSIVE for broad, distant feel
                    vx: (Math.random() - 0.5) * 0.08,
                    vy: (Math.random() - 0.5) * 0.08,
                    color: color,
                    phaseX: Math.random() * Math.PI * 2,
                    phaseY: Math.random() * Math.PI * 2,
                    sizePhase: Math.random() * Math.PI * 2
                })
            }
        }

        const draw = () => {
            if (!ctx || !canvas) return
            time.current += 0.003 // ULTRA-SLOW (Non-distracting fluidity)
            const currentScroll = window.scrollY
            scrollY.current = currentScroll

            // --- DARK DISTANT SUBSTRATE ---
            ctx.fillStyle = colors.bg
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

            ctx.globalCompositeOperation = 'screen'
            clouds.current.forEach(c => {
                // Extremely slow drift
                const driftX = Math.sin(time.current * 0.2 + c.phaseX) * 100
                const driftY = Math.cos(time.current * 0.15 + c.phaseY) * 100

                const rx = c.worldX + driftX
                const ry = (c.worldY + driftY - currentScroll * 0.3) % Math.max(document.body.scrollHeight, window.innerHeight * 4)

                if (ry < -c.radius || ry > window.innerHeight + c.radius) return

                const currentRadius = c.radius + Math.sin(time.current * 0.1 + c.sizePhase) * 100

                const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, currentRadius)
                grad.addColorStop(0, c.color)
                grad.addColorStop(0.5, 'rgba(0,0,0,0)') // Faster falloff for distance feel

                ctx.fillStyle = grad
                ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
            })
            ctx.globalCompositeOperation = 'source-over'

            animationFrame = requestAnimationFrame(draw)
        }

        window.addEventListener('resize', resize)
        resize()
        draw()
        setOpacity(1)

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrame)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 w-full h-full pointer-events-none transition-opacity duration-1000"
            style={{ opacity, background: '#02040a' }}
        />
    )
}
