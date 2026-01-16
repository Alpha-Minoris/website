
import { BlockProps } from './types'

const STEPS = [
    { num: '01', title: 'Discovery', desc: 'We deep dive into your current processes to identify high-impact automation opportunities.' },
    { num: '02', title: 'Strategy', desc: 'We design a custom AI architecture tailored to your specific business goals and constraints.' },
    { num: '03', title: 'Development', desc: 'Our engineers build, test, and refine your agents using state-of-the-art LLMs.' },
    { num: '04', title: 'Deployment', desc: 'Seamless integration into your existing stack with zero downtime.' },
]

export function HowWeWorkBlock({ id }: BlockProps) {
    return (
        <section id={id} className="py-24 bg-black relative">
            <div className="container mx-auto px-4">
                <div className="mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">How We Work</h2>
                    <p className="text-muted-foreground text-lg max-w-xl">A transparent, four-step process to transform your business.</p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 opacity-30"></div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {STEPS.map((step, idx) => (
                            <div key={idx} className="relative pt-8 group h-full flex flex-col">
                                {/* Number Chip */}
                                <div className="absolute top-0 left-0 md:left-1/2 md:-translate-x-1/2 w-24 h-24 flex items-center justify-center">
                                    <span className="text-6xl font-bold text-white/5 font-heading group-hover:text-accent/10 transition-colors duration-500">
                                        {step.num}
                                    </span>
                                </div>

                                <div className="relative bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:border-accent/30 transition-colors mt-8 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold font-heading mb-3">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
