import { BlockProps } from './types'
import { CheckCircle } from 'lucide-react'

export function MissionBlock({ id }: BlockProps) {
    return (
        <section id={id} className="py-24 bg-black relative overflow-hidden">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                {/* Left: Text */}
                <div className="space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold font-heading">
                        We bridge the gap between <span className="text-accent">Human Strategy</span> and <span className="text-accent">AI Execution</span>.
                    </h2>
                    <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                        <p>
                            Most businesses are drowning in manual tasks while AI tools sit unused. We don't just "install AI" — we architect intelligent workflows that free your team to focus on what matters.
                        </p>
                        <div className="grid gap-4 pt-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-6 h-6 text-accent shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-white font-semibold">Strategic Implementation</h4>
                                    <p className="text-sm">We analyze your bottlenecks before writing a single line of code.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-6 h-6 text-accent shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-white font-semibold">Future-Proof Architecture</h4>
                                    <p className="text-sm">Built on scalable frameworks that grow with your business.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Abstract Visual */}
                <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full opacity-20"></div>
                    <div className="relative h-[500px] w-full bg-white/5 border border-white/10 backdrop-blur-3xl rounded-3xl flex items-center justify-center p-8">
                        {/* Abstract Graphic */}
                        <div className="relative w-full h-full border border-white/5 rounded-2xl overflow-hidden group">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.05))]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/30 rounded-full blur-3xl group-hover:bg-accent/40 transition-colors duration-700"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl font-bold text-white/5 font-heading">MISSION</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
