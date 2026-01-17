'use client'

import { BlockProps } from './types'
import { createClient } from '@/lib/supabase/client'
import { CaseStudyGridClient } from './case-study-grid-client'
import { useEffect, useState } from 'react'
import { useEditorStore } from '@/lib/stores/editor-store'

export function CaseStudyGridBlock({ id, settings }: BlockProps) {
    const { isEditMode } = useEditorStore()
    const [caseStudies, setCaseStudies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStudies = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('website_case_studies')
                .select('*')
                .eq('is_enabled', true)
                .order('sort_order', { ascending: true })
                .limit(6)

            if (data) setCaseStudies(data)
            setLoading(false)
        }
        fetchStudies()
    }, [])

    if (loading) return <div className="py-24 bg-black text-white/50 text-center">Loading cases...</div>
    if (caseStudies.length === 0) return null

    return (
        <section id={id} className="py-24 bg-black relative">
            <CaseStudyGridClient
                id={id}
                caseStudies={caseStudies}
                settings={settings}
                isEditMode={isEditMode}
            />
        </section>
    )
}
