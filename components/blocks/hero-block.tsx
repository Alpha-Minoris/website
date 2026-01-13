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

            <div className="container mx-auto px-4 z-10 grid lg:grid-cols-2 gap-12 items-center mb-32">
                {/* Left Column: Text */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-accent uppercase tracking-widest font-bold">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                        AI Automation Agency
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold font-heading leading-[1.1] text-white">
                        Automate Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                            Future Today.
                        </span>
                    </h1>

                    <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                        We build custom AI agents and automation workflows that scale your business. Stop trading time for money.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Button size="lg" className="rounded-full h-12 px-8 text-base bg-white text-black hover:bg-white/90" asChild>
                            <a href="#contact">Start Building</a>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full h-12 px-8 text-base border-white/20 text-white hover:bg-white/10">
                            View Case Studies
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-4">
                        {['Proven Frameworks', 'Scalable Architecture', 'Fast Delivery'].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-accent" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Glass Card Demo */}
                <div className="relative hidden lg:block">
                    <div className="absolute -inset-4 bg-accent/20 blur-3xl rounded-full opacity-30"></div>
                    <div className="relative bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700 ease-out">
                        {/* Fake UI Elements */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="h-8 w-8 rounded-full bg-white/10"></div>
                                <div className="h-4 w-24 rounded-full bg-white/10"></div>
                            </div>
                            <div className="h-32 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5"></div>
                            <div className="space-y-3">
                                <div className="h-4 w-3/4 rounded-full bg-white/10"></div>
                                <div className="h-4 w-1/2 rounded-full bg-white/10"></div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 flex-1 rounded-lg bg-accent/20 border border-accent/20"></div>
                                <div className="h-10 w-10 rounded-lg bg-white/5"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logo Ribbon */}
            <LogoRibbon />
        </section>
    )
}
