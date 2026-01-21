import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { BlockProps, BlockType } from '@/components/blocks/types'
import { PageBuilder } from '@/components/editor/page-builder'
import { Navbar } from '@/components/layout/navbar'
import { getSections, getDraftVersions } from '@/lib/cache/edit-cache'
import { EditorToggle } from '@/components/editor/editor-toggle'
import { EditorSidebar } from '@/components/editor/editor-sidebar'
import { VersionManager } from '@/components/editor/version-manager'
import VersionManagerWrapper from '@/components/editor/version-manager-wrapper'

// AUTHENTICATED ROUTE: Dynamic rendering for editing
export const dynamic = 'force-dynamic'

async function isAuthenticated() {
    const headersList = await headers()
    const host = headersList.get('host') || ''

    // Localhost = authenticated (dev bypass)
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        return true
    }

    // Future: Check Supabase session
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // return !!user

    return false
}

export default async function EditPage() {
    const isAuth = await isAuthenticated()

    if (!isAuth) {
        redirect('/')
    }

    let sections
    let error
    try {
        sections = await getSections()
    } catch (e: any) {
        error = e
        console.error('Error fetching sections:', e)
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Error loading page content. Check logs.
            </div>
        )
    }

    if (!sections || sections.length === 0) {
        return (
            <main className="min-h-screen bg-transparent text-foreground selection:bg-accent/30">
                <Navbar sections={[]} />
                <PageBuilder initialBlocks={[]} isEditMode={true} />
                <EditorToggle />
                <EditorSidebar />
            </main>
        )
    }

    const sectionIds = sections.map(s => s.id)

    // Load DRAFT versions in edit mode (editor sees drafts, not published)
    const versions = await getDraftVersions(sectionIds)

    const versionMap = new Map()
    versions?.forEach(v => versionMap.set(v.section_id, v))

    const knownBlockTypes = [
        'hero', 'mission', 'services', 'packages', 'how-we-work',
        'team', 'testimonials', 'faq', 'contact', 'case-studies',
        'rich-text', 'generic-section', 'heading', 'card',
        'flip-trigger', 'grid-section', 'icon'
    ] as const

    const blocks: BlockProps[] = sections.map(section => {
        const version = versionMap.get(section.id)
        let blockType: string = section.slug

        if (version?.layout_json?.type) {
            blockType = version.layout_json.type
        } else if (!knownBlockTypes.includes(section.slug as any)) {
            blockType = 'generic-section'
        }

        const layoutContent = version?.layout_json?.content
        const hasLayoutContent = Array.isArray(layoutContent) && layoutContent.length > 0

        const block: BlockProps = {
            id: section.id,
            type: blockType as BlockType,
            content: hasLayoutContent ? layoutContent : (version?.content_html || []),
            // Merge layout_json root with nested settings for backward compatibility  
            settings: version?.layout_json ? { ...version.layout_json, ...version.layout_json.settings } : {},
            is_enabled: section.is_enabled,
            title: section.title,
            slug: section.slug
        }

        return block
    })

    return (
        <main className="min-h-screen bg-transparent text-foreground selection:bg-accent/30">
            <Navbar sections={sections} />
            <PageBuilder initialBlocks={blocks} isEditMode={false} />
            <EditorToggle />
            <EditorSidebar />
            <VersionManagerWrapper />
        </main>
    )
}
