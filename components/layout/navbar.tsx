'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

interface NavbarProps {
    sections: {
        id: string
        slug: string
        title: string
        is_enabled: boolean
    }[]
}

export function Navbar({ sections }: NavbarProps) {
    const { isEditMode } = useEditorStore()
    const [activeSection, setActiveSection] = useState<string>('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Filter enabled sections and those not prefixed with '_'
    const navItems = sections.filter(s => s.is_enabled && !s.title.startsWith('_'))

    // Handle scroll spy
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100

            for (const section of navItems) {
                // Use slug if available, else ID
                const targetId = section.slug || section.id
                const element = document.getElementById(targetId)

                if (element) {
                    const { offsetTop, offsetHeight } = element
                    if (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    ) {
                        setActiveSection(section.id) // Keep tracking active by ID internally or switch to slug? 
                        // Let's stick to checking equality against ID for state, but looking up DOM by slug.
                        // Actually better to use ID for state to avoid confusion if slug changes? 
                        // But href is #slug. Active state usually matches href. 
                        // Let's use ID for state, but ensure href matches DOM id.
                    }
                }
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [navItems])

    const scrollToSection = (e: React.MouseEvent, identifier: string) => {
        e.preventDefault()
        const element = document.getElementById(identifier)
        if (element) {
            const offset = 80
            const bodyRect = document.body.getBoundingClientRect().top
            const elementRect = element.getBoundingClientRect().top
            const elementPosition = elementRect - bodyRect
            const offsetPosition = elementPosition - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
            setIsMobileMenuOpen(false)
        }
    }

    if (isEditMode) return null

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
            <div className="container mx-auto">
                <nav className="bg-black/40 backdrop-blur-3xl backdrop-saturate-150 border border-white/[0.08] rounded-full px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-between pointer-events-auto transition-all duration-300">

                    {/* Brand */}
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className="text-lg font-bold font-heading text-white hover:text-accent transition-colors hidden md:block"
                    >
                        Alpha Minoris
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex flex-1 items-center justify-center px-4">
                        <div className="flex flex-wrap justify-center gap-1">
                            {navItems.map((section) => {
                                const targetId = section.slug || section.id
                                return (
                                    <a
                                        key={section.id}
                                        href={`#${targetId}`}
                                        onClick={(e) => scrollToSection(e, targetId)}
                                        className={cn(
                                            "px-3 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap",
                                            activeSection === section.id // we still track active by ID in spy? 
                                                // Wait, spy above sets activeSection to ID. So this check works.
                                                ? "bg-white/10 text-white"
                                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {section.title}
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:block shrink-0">
                        <Button
                            onClick={(e) => scrollToSection(e, 'contact')} // Assuming 'contact' slug/id exists or we filter for it
                            className="rounded-md bg-accent text-white hover:bg-accent/90 font-bold px-6 shadow-glow"
                        >
                            Contact Us
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center justify-between w-full md:hidden">
                        <span className="text-lg font-bold font-heading text-white">Alpha Minoris</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white hover:bg-white/10"
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </Button>
                    </div>
                </nav>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-20 left-4 right-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto md:hidden"
                        >
                            <div className="flex flex-col gap-2">
                                {navItems.map((section) => {
                                    const targetId = section.slug || section.id
                                    return (
                                        <a
                                            key={section.id}
                                            href={`#${targetId}`}
                                            onClick={(e) => scrollToSection(e, targetId)}
                                            className={cn(
                                                "px-4 py-3 text-sm font-medium rounded-xl transition-all",
                                                activeSection === section.id
                                                    ? "bg-white/10 text-white"
                                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {section.title}
                                        </a>
                                    )
                                })}
                                <div className="h-px bg-white/10 my-2" />
                                <Button
                                    onClick={(e) => scrollToSection(e, 'contact')}
                                    className="w-full rounded-xl bg-accent text-white hover:bg-accent/90 font-bold"
                                >
                                    Contact Us
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}
