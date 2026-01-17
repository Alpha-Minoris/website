import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden font-heading text-white selection:bg-white/20">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none mix-blend-overlay" />

            {/* Decorative Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

            <div className="relative z-10 max-w-2xl w-full px-4 text-center space-y-8">

                {/* Glitch Effect 404 */}
                <div className="relative group">
                    <h1 className="text-[150px] md:text-[200px] leading-none font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 mix-blend-screen pointer-events-none transition-opacity duration-100">
                        <h1 className="text-[150px] md:text-[200px] leading-none font-bold tracking-tighter text-red-500/50 animate-pulse translate-x-[2px]">404</h1>
                        <h1 className="text-[150px] md:text-[200px] leading-none font-bold tracking-tighter text-blue-500/50 animate-pulse -translate-x-[2px] absolute inset-0 flex items-center justify-center">404</h1>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white/90">
                        Signal Lost in the Void
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
                        The page you are looking for has been moved, deleted, or never existed in this timeline.
                    </p>
                </div>

                {/* Action Card */}
                <div className="mt-12 p-1 bg-gradient-to-b from-white/10 to-transparent rounded-2xl mx-auto w-fit">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl flex flex-col items-center gap-6">

                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <Link href="/" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto rounded-full bg-white text-black hover:bg-zinc-200 font-medium px-8 h-12 gap-2 text-base transition-all hover:scale-105">
                                    <Home className="w-4 h-4" />
                                    Return Home
                                </Button>
                            </Link>

                            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-white/10 text-white hover:bg-white/5 hover:text-white hover:border-white/20 h-12 gap-2 text-base transition-all">
                                <Search className="w-4 h-4" />
                                Search Archives
                            </Button>
                        </div>

                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <Link href="#" className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1 group">
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            Go back to previous page
                        </Link>
                    </div>
                </div>

                <div className="pt-20 text-[10px] text-zinc-700 font-mono tracking-widest uppercase opacity-50">
                    System Status: Nominal // Error: Page_Not_Found // Code: 404
                </div>
            </div>
        </div>
    )
}
