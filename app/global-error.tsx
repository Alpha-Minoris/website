'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import './globals.css' // Ensure styles load

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html lang="en">
            <body className="bg-black text-white font-sans antialiased overflow-hidden">
                <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">

                    {/* Background Ambience */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-black to-black z-0 pointer-events-none" />
                    <div className="absolute inset-0 opacity-20 z-0 pointer-events-none mix-blend-overlay bg-noise" />

                    {/* Content */}
                    <div className="relative z-10 max-w-xl w-full px-4 text-center space-y-6">
                        <div className="relative">
                            <h1 className="text-[120px] md:text-[180px] leading-none font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-red-200 select-none">
                                CRITICAL
                            </h1>
                        </div>

                        <h2 className="text-2xl font-light tracking-tight text-white/90">
                            Global System Failure
                        </h2>

                        <p className="text-zinc-400">
                            The navigational computer has encountered an unrecoverable error.
                            A manual system reboot is required.
                        </p>

                        <div className="pt-8">
                            <Button
                                size="lg"
                                onClick={() => reset()}
                                className="rounded-lg bg-red-600 text-white hover:bg-red-500 font-medium px-8 h-12 gap-2 text-base transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Initiate Hard Reboot
                            </Button>
                        </div>
                    </div>

                    <div className="absolute bottom-8 text-[10px] text-zinc-800 font-mono tracking-widest uppercase">
                        System: Alpha_Minoris_Core // Err: ROOT_LAYOUT_FAILURE
                    </div>
                </div>
            </body>
        </html>
    )
}
