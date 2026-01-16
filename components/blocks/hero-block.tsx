'use client'

import { BlockProps } from './types'
import { Button } from '@/components/ui/button'
import { LogoRibbon } from './hero/logo-ribbon'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HeroBlock({ content }: BlockProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20">
            {/* Background Noise & Gradient */}
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>

            <div className="container mx-auto px-4 z-10 flex flex-col items-center justify-center text-center mb-32">
                {/* Center Column: Text */}
                <div className="space-y-8 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-accent uppercase tracking-widest font-bold mx-auto">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                        AI Automation Agency
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold font-heading leading-[1.1] text-white">
                        Automate Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                            Future Today.
                        </span>
                    </h1>

                    <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
                        We build custom AI agents and automation workflows that scale your business. Stop trading time for money.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-white/90" asChild>
                            <a href="#contact">Start Building</a>
                        </Button>
                        <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/10">
                            View Case Studies
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-4 justify-center">
                        {['Proven Frameworks', 'Scalable Architecture', 'Fast Delivery'].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-accent" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Logo Ribbon */}
            <LogoRibbon />
        </section>
    )
}
