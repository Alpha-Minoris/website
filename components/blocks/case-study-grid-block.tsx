
import { BlockProps } from './types'
import { createClient } from '@/lib/supabase/server'
import { CaseStudyGridClient } from './case-study-grid-client'

export async function CaseStudyGridBlock({ id }: BlockProps) {
    const supabase = await createClient()

    // Fetch Case Studies
    const { data: caseStudies } = await supabase
        .from('website_case_studies')
        .select('*')
        .eq('is_enabled', true)
        .order('sort_order', { ascending: true })
        .limit(6)

    if (!caseStudies || caseStudies.length === 0) {
        return null
    }

    return (
        <section id={id} className="py-24 bg-black relative">
            <CaseStudyGridClient caseStudies={caseStudies} />
        </section>
    )
}
