import { BlockProps } from './types'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const PACKAGES = [
    {
        name: 'Starter',
        desc: 'For small teams exploring AI.',
        features: ['1 Custom AI Agent', 'Basic Workflow Automation', 'Email Support', 'Weekly Reports']
    },
    {
        name: 'Growth',
        desc: 'For scaling businesses.',
        highlight: true,
        features: ['3 Custom AI Agents', 'Full CRM Integration', 'Priority Support', 'Daily Analytics', 'Strategy Consulting']
    },
    {
        name: 'Enterprise',
        desc: 'For large organizations.',
        features: ['Unlimited Agents', 'Custom LLM Fine-tuning', 'Dedicated Success Manager', 'SLA Guarantee', 'On-premise Deployment']
    }
]

export function PackagesBlock({ id }: BlockProps) {
    return (
        <section id={id} className="py-24 bg-black relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading">Simple Packages</h2>
                    <p className="text-muted-foreground text-lg">Transparent engagement models. No hidden fees.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {PACKAGES.map((pkg, idx) => (
                        <Card key={idx} className={cn(
                            "relative flex flex-col border-white/10 backdrop-blur-sm transition-all duration-300",
                            pkg.highlight ? "bg-white/10 border-accent/50 shadow-2xl scale-105 z-10" : "bg-white/5 hover:bg-white/8"
                        )}>
                            {pkg.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold uppercase tracking-widest rounded-full">
                                    Most Popular
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl font-heading">{pkg.name}</CardTitle>
                                <CardDescription className="text-white/60">{pkg.desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-4">
                                    {pkg.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                                            <Check className="w-5 h-5 text-accent shrink-0" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className={cn(
                                    "w-full rounded-full h-12 text-base",
                                    pkg.highlight ? "bg-white text-black hover:bg-white/90" : "bg-white/10 hover:bg-white/20 text-white"
                                )} asChild>
                                    <a href="#contact">Get Started</a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
