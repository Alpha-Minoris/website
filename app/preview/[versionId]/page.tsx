import { createAdminClient } from '@/lib/supabase/server'
import { BlockProps, BlockType } from '@/components/blocks/types'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import { Navbar } from '@/components/layout/navbar'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PreviewPageProps {
    params: Promise<{ versionId: string }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
    const { versionId } = await params
    const supabase = await createAdminClient()

    // 1. Fetch the specific version
    const { data: version, error } = await supabase
        .from('website_section_versions')
        .select(`
            *,
            website_sections (
                id,
                title,
                slug
            )
        `)
        .eq('id', versionId)
        .single()

    if (error || !version) {
        return notFound()
    }

    const section = version.website_sections

    // 2. Construct block props for this single section
    const knownBlockTypes = [
        'hero', 'mission', 'services', 'packages', 'how-we-work',
        'team', 'testimonials', 'faq', 'contact', 'case-studies',
        'rich-text', 'generic-section', 'heading', 'card',
        'flip-trigger', 'grid-section', 'icon'
    ] as const

    let blockType: string = section.slug

    if (version.layout_json?.type) {
        blockType = version.layout_json.type
    } else if (!knownBlockTypes.includes(section.slug as any)) {
        blockType = 'generic-section'
    }

    const layoutContent = version.layout_json?.content
    const hasLayoutContent = Array.isArray(layoutContent) && layoutContent.length > 0

    const block: BlockProps = {
        id: section.id,
        type: blockType as BlockType,
        content: hasLayoutContent ? layoutContent : (version.content_html || []),
        settings: version.layout_json ? { ...version.layout_json, ...version.layout_json.settings } : {},
        is_enabled: true,
        title: section.title,
        slug: section.slug
    }

    return (
        <main className="min-h-screen bg-[#02040a] text-white">
            {/* Minimal Navbar or just the block */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none">
                <div className="bg-blue-600/20 border border-blue-500/20 backdrop-blur-md px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest text-blue-400 pointer-events-auto">
                    Historical Preview Mode
                </div>
            </div>

            <div className="pt-20">
                <BlockRenderer blocks={[block]} />
            </div>

            {/* Warning Overlay */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-zinc-950/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center gap-4">
                <div className="text-xs text-zinc-400">
                    This is a <span className="text-white font-medium">read-only</span> preview of a historical version.
                </div>
                <button
                    onClick={() => { }}
                    className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 hover:text-white transition-colors"
                >
                    Close Tab
                </button>
            </div>
        </main>
    )
}
