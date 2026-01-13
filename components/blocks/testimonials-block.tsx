
import { BlockProps } from './types'
import { Quote } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export async function TestimonialsBlock({ id }: BlockProps) {
    const supabase = await createClient()
    const { data: testimonials } = await supabase
        .from('website_testimonials')
        .select('*')
        .eq('is_enabled', true)
        .order('created_at', { ascending: false })
        .limit(3)

    if (!testimonials || testimonials.length === 0) return null

    return (
        <section id={id} className="py-24 bg-black relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(12,117,154,0.1),transparent_70%)] pointer-events-none"></div>

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">Client Stories</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <div key={t.id} className="bg-white/5 border border-white/10 p-8 rounded-2xl relative">
                            <Quote className="w-10 h-10 text-accent/20 absolute top-6 left-6" />
                            <div className="relative z-10 space-y-6 pt-6">
                                <p className="text-lg font-medium text-white/90 leading-relaxed">
                                    "{t.quote}"
                                </p>
                                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{t.name}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-widest">
                                            {t.role}, {t.company}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
