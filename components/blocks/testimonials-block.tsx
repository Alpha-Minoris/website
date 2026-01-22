'use client'

import { BlockProps } from './types'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { TestimonialCarousel } from './testimonials/testimonial-carousel'
import { useEditorStore } from '@/lib/stores/editor-store'
import { EditableText } from '@/components/editor/editable-text'
import { TextToolbar } from '@/components/editor/text-toolbar'

export function TestimonialsBlock(block: BlockProps) {
    const { id, slug } = block
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)
    const [testimonials, setTestimonials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Local state - entire block
    const [localBlock, setLocalBlock] = useState({
        title: 'Client Stories',
        ...block
    })

    // Use ref to always get latest state (fixes stale closure in saveBlock)
    const localBlockRef = useRef(localBlock)
    useEffect(() => {
        localBlockRef.current = localBlock
    }, [localBlock])

    const saveBlock = useCallback((updates: any) => {
        const currentBlock = localBlockRef.current
        const updatedBlock = { ...currentBlock, ...updates }
        setLocalBlock(updatedBlock)
        localBlockRef.current = updatedBlock
        updateBlock(id, updatedBlock)
    }, [id, updateBlock])

    const handleTextChange = (key: string, value: string) => {
        saveBlock({ [key]: value })
    }

    const onTextFocus = useCallback((rect: DOMRect) => {
        if (sectionRef.current) {
            const sectionRect = sectionRef.current.getBoundingClientRect()
            const relativeLeft = rect.left - sectionRect.left + (rect.width / 2)
            const relativeTop = rect.bottom - sectionRect.top
            setActiveToolbarPos({ top: relativeTop, left: relativeLeft })
        }
    }, [])

    const onTextBlur = useCallback(() => {
        setTimeout(() => {
            const activeEl = document.activeElement
            if (!sectionRef.current?.contains(activeEl) && !activeEl?.closest('[data-radix-portal]')) {
                setActiveToolbarPos(null)
            }
        }, 150)
    }, [])

    useEffect(() => {
        const fetchTestimonials = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('website_testimonials')
                .select('*')
                .eq('is_enabled', true)
                .order('created_at', { ascending: false })
                .limit(5)

            if (data) setTestimonials(data)
            setLoading(false)
        }
        fetchTestimonials()
    }, [])

    if (loading) return <div className="py-24 bg-transparent text-white/50 text-center">Loading testimonials...</div>
    if (testimonials.length === 0) return null

    return (
        <section id={id} ref={sectionRef} className="py-24 bg-transparent relative overflow-hidden">
            {/* Local Toolbar */}
            {isEditMode && activeToolbarPos && (
                <div
                    className="absolute z-50 transition-all duration-100"
                    style={{ top: activeToolbarPos.top, left: activeToolbarPos.left, transform: 'translateY(-10px)' }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <TextToolbar blockId={id} />
                </div>
            )}

            {/* No local background - seamless with global DynamicBackground */}

            <div className="container mx-auto px-4">
                <div className="text-center mb-16 relative">
                    <EditableText
                        tagName="h2"
                        value={localBlock.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4"
                    />
                </div>

                <TestimonialCarousel testimonials={testimonials} />
            </div>
        </section>
    )
}


