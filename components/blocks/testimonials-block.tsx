'use client'

import { BlockProps } from './types'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { TestimonialCarousel } from './testimonials/testimonial-carousel'

export function TestimonialsBlock({ id }: BlockProps) {
    const [testimonials, setTestimonials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTestimonials = async () => {
            // ... existing fetch logic
            const supabase = createClient()
            const { data } = await supabase
                .from('website_testimonials')
                .select('*')
                .eq('is_enabled', true)
                .order('created_at', { ascending: false })
                .limit(5) // Increased limit for carousel

            if (data) setTestimonials(data)
            setLoading(false)
        }
        fetchTestimonials()
    }, [])

    if (loading) return <div className="py-24 bg-black text-white/50 text-center">Loading testimonials...</div>
    if (testimonials.length === 0) return null

    return (
        <section id={id} className="py-24 bg-black relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(12,117,154,0.1),transparent_70%)] pointer-events-none"></div>

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">Client Stories</h2>
                </div>

                <TestimonialCarousel testimonials={testimonials} />
            </div>
        </section>
    )
}
