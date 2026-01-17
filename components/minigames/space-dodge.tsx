'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw } from 'lucide-react'

export function SpaceDodgeGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start')
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let playerX = canvas.width / 2
        let obstacles: { x: number, y: number, size: number, speed: number }[] = []
        let stars: { x: number, y: number, size: number, speed: number, handled: boolean }[] = []
        let frameCount = 0
        let currentScore = 0
        let gameActive = false

        const resize = () => {
            canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
            canvas.height = 300 // Fixed height for the game area
            playerX = canvas.width / 2
        }
        window.addEventListener('resize', resize)
        resize()

        // Input handling
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!gameActive) return
            const rect = canvas.getBoundingClientRect()
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
            playerX = clientX - rect.left

            // Clamp
            if (playerX < 0) playerX = 0
            if (playerX > canvas.width) playerX = canvas.width
        }

        canvas.addEventListener('mousemove', handleMove)
        canvas.addEventListener('touchmove', handleMove)

        // Game Loop
        const render = () => {
            if (!gameActive) return

            frameCount++

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Spawn Obstacles
            if (frameCount % 60 === 0) { // Every second-ish
                const difficulty = Math.min(5, 1 + currentScore / 500) // Speed up
                obstacles.push({
                    x: Math.random() * canvas.width,
                    y: -20,
                    size: Math.random() * 10 + 10,
                    speed: (Math.random() * 2 + 2) * difficulty
                })
            }

            // Update & Draw Obstacles (Debris)
            ctx.fillStyle = '#f8fafc' // Slate-50 (White/Silver debris)
            ctx.shadowBlur = 15
            ctx.shadowColor = '#ffffff'

            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i]
                obs.y += obs.speed

                // Draw Debris (Jagged Circle)
                ctx.beginPath()
                ctx.arc(obs.x, obs.y, obs.size, 0, Math.PI * 2)
                ctx.fill()

                // Collision
                const playerY = canvas.height - 40
                const dist = Math.hypot(playerX - obs.x, playerY - obs.y)

                if (dist < obs.size + 10) {
                    gameOver()
                    return
                }

                // Score & Cleanup
                if (obs.y > canvas.height + 20) {
                    obstacles.splice(i, 1)
                    currentScore += 10
                    setScore(currentScore)
                }
            }

            ctx.shadowBlur = 0

            // Draw Player (Northern Star Ship)
            ctx.fillStyle = '#06b6d4' // Cyan-500
            ctx.shadowBlur = 20
            ctx.shadowColor = '#06b6d4'
            ctx.beginPath()
            ctx.moveTo(playerX, canvas.height - 50) // Top
            ctx.lineTo(playerX - 12, canvas.height - 15) // Bottom Left
            ctx.lineTo(playerX, canvas.height - 25) // Center indent
            ctx.lineTo(playerX + 12, canvas.height - 15) // Bottom Right
            ctx.closePath()
            ctx.fill()

            // Engine Trail (Ion Drive)
            ctx.fillStyle = '#ccfbf1' // Teal-100
            ctx.shadowBlur = 10
            ctx.shadowColor = '#ccfbf1'
            ctx.beginPath()
            ctx.moveTo(playerX - 6, canvas.height - 20)
            ctx.lineTo(playerX + 6, canvas.height - 20)
            ctx.lineTo(playerX, canvas.height - 10 + Math.random() * 20) // Longer trail
            ctx.fill()

            animationFrameId = requestAnimationFrame(render)
        }

        const initGame = () => {
            // Reset Game Variables
            setScore(0)
            currentScore = 0
            obstacles = []
            frameCount = 0
            gameActive = true
            render()
        }

        const gameOver = () => {
            gameActive = false
            setGameState('gameover')
            if (currentScore > highScore) setHighScore(currentScore)
            cancelAnimationFrame(animationFrameId)
        }

        // Expose start/stop to effect scope if needed, 
        // but we rely on state causing re-renders or internal flags

        // We need to attach start logic to the state change
        if (gameState === 'playing') {
            initGame()
        }

        return () => {
            window.removeEventListener('resize', resize)
            canvas.removeEventListener('mousemove', handleMove)
            canvas.removeEventListener('touchmove', handleMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [gameState])

    return (
        <div className="w-full max-w-2xl mx-auto relative border border-white/10 bg-zinc-950/80 backdrop-blur-[20px] rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute top-4 left-4 z-10 font-mono text-xs text-zinc-400 pointer-events-none">
                SCORE: <span className="text-white">{score}</span> <span className="ml-4 opacity-50">HIGH: {highScore}</span>
            </div>

            <canvas
                ref={canvasRef}
                className="w-full h-[300px] cursor-none block touch-none"
            />

            {gameState !== 'playing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-20">
                    <div className="text-center space-y-4">
                        {gameState === 'gameover' && (
                            <div className="text-red-500 font-bold tracking-widest animate-pulse">MISSION FAILED</div>
                        )}
                        <Button
                            onClick={() => setGameState('playing')}
                            size="lg"
                            className="rounded-full px-8 bg-white text-black hover:bg-zinc-200"
                        >
                            {gameState === 'start' ? <><Play className="w-4 h-4 mr-2" /> Launch Pilot Training</> : <><RotateCcw className="w-4 h-4 mr-2" /> Retry Mission</>}
                        </Button>
                        <p className="text-[10px] text-zinc-500 font-mono">
                            Use Mouse / Touch to Dodge Debris
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
