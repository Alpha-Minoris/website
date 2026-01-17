'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden font-heading text-white selection:bg-red-500/20">

            {/* Background Ambience - Red Tint for Error */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none mix-blend-overlay" />

            {/* Decorative Orbs - Error State */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />

            <div className="relative z-10 max-w-2xl w-full px-4 text-center space-y-8">

                {/* Glitch Effect 500 */}
                <div className="relative group">
                    <h1 className="text-[180px] md:text-[280px] leading-none font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none">
                        500
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center opacity-70 mix-blend-screen pointer-events-none">
                        <h1 className="text-[180px] md:text-[280px] leading-none font-bold tracking-tighter text-red-500/20 animate-pulse translate-x-[1px] skew-x-1">500</h1>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white/90">
                        Core System Failure
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
                        An unexpected anomaly has occurred within the Alpha Minoris mainframe. Our engineers have been alerted.
                    </p>
                    {error.digest && (
                        <p className="text-xs font-mono text-zinc-600 bg-black/50 w-fit mx-auto px-2 py-1 rounded border border-white/5">
                            Error Digest: {error.digest}
                        </p>
                    )}
                </div>

                {/* Action Card */}
                <div className="mt-12 p-1 bg-gradient-to-b from-red-500/20 to-transparent rounded-2xl mx-auto w-fit">
                    <div className="bg-black/80 backdrop-blur-xl border border-red-500/10 rounded-xl p-8 shadow-2xl flex flex-col items-center gap-6">

                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <Button
                                size="lg"
                                onClick={() => reset()}
                                className="w-full sm:w-auto rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-12 gap-2 text-base transition-all hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Reboot System (Try Again)
                            </Button>

                            <Link href="/" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-lg border-white/10 text-white hover:bg-white/5 hover:text-white hover:border-white/20 h-12 gap-2 text-base transition-all">
                                    <Home className="w-4 h-4" />
                                    Emergency Exit
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="pt-20 flex flex-col items-center gap-2 text-[10px] text-red-900/50 font-mono tracking-widest uppercase opacity-70">
                    <div>System ID: NORTHERN_STAR_V9 // ALERT_LEVEL: CRITICAL</div>
                    <div>Status: Runtime_Exception // Code: 500</div>
                </div>
            </div>
        </div>
    )
}
