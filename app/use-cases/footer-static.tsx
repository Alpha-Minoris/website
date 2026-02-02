'use client'

import Link from 'next/link'

interface FooterBlockData {
  logoType?: 'icon' | 'image';
  logoValue?: string;
  brandTitle?: string;
  tagline?: string;
  legalLinks?: string[];
  companyLines?: string[];
  sitemapLinks?: string[];
  socialLinks?: string[];
  legalTitle?: string;
  companyTitle?: string;
}

export function FooterStatic({ footerBlock }: { footerBlock?: FooterBlockData | null }) {
    const year = new Date().getFullYear()

    // Use data from database if available, otherwise use defaults
    const brandTitle = footerBlock?.brandTitle || "Alpha Minoris"
    const tagline = footerBlock?.tagline || "Building the automated future, one agent at a time."
    const logoType = footerBlock?.logoType || 'image'
    const logoValue = footerBlock?.logoValue || ''
    const legalLinks = footerBlock?.legalLinks || ['<a href="#">Privacy Policy</a>', '<a href="#">Terms of Service</a>', '<a href="#">Cookie Policy</a>', '<a href="#">Impressum</a>']
    const companyLines = footerBlock?.companyLines || ['Alpha Minoris Agency', '123 Innovation Drive', 'Tech City, TC 90210']
    const sitemapLinks = footerBlock?.sitemapLinks || ['<a href="/">Home</a>', '<a href="#services">Services</a>', '<a href="#contact">Contact</a>']
    const socialLinks = footerBlock?.socialLinks || ['<a href="#">Twitter</a>', '<a href="#">LinkedIn</a>', '<a href="#">GitHub</a>']
    const legalTitle = footerBlock?.legalTitle || "Legal"
    const companyTitle = footerBlock?.companyTitle || "Company"

    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8 text-sm text-muted-foreground relative z-10 w-full">
            <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16">
                {/* Column 1: Brand & Tagline */}
                <div className="space-y-6 flex flex-col items-center md:items-start">
                    <div className="w-32 h-32 relative bg-zinc-900/50 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                        {logoType === 'image' && logoValue ? (
                            <img 
                                src={logoValue} 
                                alt={brandTitle}
                                className="w-full h-full object-contain p-4"
                            />
                        ) : (
                            <span className="text-4xl font-bold text-white">α</span>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white font-heading text-center md:text-left">
                            {brandTitle}
                        </h3>
                        <p className="leading-relaxed text-center md:text-left">
                            {tagline}
                        </p>
                    </div>
                </div>

                {/* Column 2: Legal */}
                <div className="space-y-4 flex flex-col">
                    <h4 className="font-bold text-white uppercase tracking-wider text-xs">{legalTitle}</h4>
                    <div className="space-y-3">
                        {legalLinks.map((html, i) => (
                            <div key={i} dangerouslySetInnerHTML={{ __html: html }} className="hover:text-white transition-colors cursor-pointer" />
                        ))}
                    </div>
                </div>

                {/* Column 3: Company */}
                <div className="space-y-4">
                    <h4 className="font-bold text-white uppercase tracking-wider text-xs">{companyTitle}</h4>
                    <div className="space-y-3">
                        {companyLines.map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                </div>

                {/* Column 4: Sitemap */}
                <div className="space-y-4 flex flex-col">
                    <h4 className="font-bold text-white uppercase tracking-wider text-xs">Sitemap</h4>
                    <div className="space-y-3">
                        {sitemapLinks.map((html, i) => (
                            <div key={i} dangerouslySetInnerHTML={{ __html: html }} className="hover:text-white transition-colors cursor-pointer" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-8 border-t border-white/5 text-xs text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; {year} {brandTitle}. All rights reserved.</p>
                <div className="flex gap-4 items-center">
                    {socialLinks.map((html, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ __html: html }} className="hover:text-white transition-colors cursor-pointer" />
                    ))}
                </div>
            </div>
        </footer>
    )
}
