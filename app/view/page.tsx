import { BlockProps, BlockType } from '@/components/blocks/types'
import { PageBuilder } from '@/components/editor/page-builder'
import { Navbar } from '@/components/layout/navbar'
import { getSections, getVersions } from '@/lib/cache/page-cache'
import { BackToEditButton } from '@/components/editor/back-to-edit-button'
import { createAdminClient } from '@/lib/supabase/server'

// PUBLIC ROUTE: ISR with on-demand revalidation
// Static generation with 1-hour cache, invalidated on publish
// Editing happens at /edit route
export const revalidate = 21600 // ISR: 6 hours (webhook handles instant updates)

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview: previewVersionId } = await searchParams

  // Fetch preview version first if needed  
  let previewVersion = null
  let previewSectionId = null
  if (previewVersionId) {
    const supabase = await createAdminClient()
    console.log('[Preview] Fetching version:', previewVersionId)

    const { data: version, error } = await supabase
      .from('website_section_versions')
      .select('*, website_sections!section_id(id, title, slug, is_enabled)')
      .eq('id', previewVersionId)
      .single()

    console.log('[Preview] Query result:', { version: version?.id, error: error?.message })

    if (error || !version) {
      console.error('[Preview] Failed to fetch version:', error)
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#02040a]">
          <div className="max-w-md w-full mx-4">
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl p-8 text-center">
              <div className="text-red-400 text-sm font-bold uppercase tracking-wider mb-2">Preview Error</div>
              <div className="text-white text-lg mb-4">Version not found</div>
              <div className="text-zinc-400 text-sm">The requested version may have been deleted or does not exist.</div>
            </div>
          </div>
        </div>
      )
    }
    previewVersion = version
    previewSectionId = version.website_sections.id
  }


  // Public page: NEVER has editing (middleware redirects authenticated users to /edit)

  // PERFORMANCE: Database calls are cached via unstable_cache
  let sections
  let error
  try {
    sections = await getSections()
    if (sections) {
      console.log(`[Page] Loaded ${sections.length} sections`)
    }
  } catch (e: any) {
    error = e
    console.error('Error fetching sections:', e)
  }

  if (error) {
    console.error('Error fetching sections:', error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading page content. Check logs.
      </div>
    )
  }

  // 2. Fetch Published Versions (also cached at page level)
  if (!sections || sections.length === 0) {
    return (
      <main className="min-h-screen bg-transparent text-foreground selection:bg-accent/30">
        <Navbar sections={[]} />
        <PageBuilder initialBlocks={[]} isEditMode={false} />
        <BackToEditButton />
      </main>
    )
  }

  const sectionIds = sections.map(s => s.id)
  const versions = await getVersions(sectionIds)

  const versionMap = new Map()
  versions?.forEach(v => versionMap.set(v.section_id, v))

  // Known block types that are registered
  const knownBlockTypes = [
    'hero', 'mission', 'services', 'packages', 'how-we-work',
    'team', 'testimonials', 'faq', 'contact', 'case-studies',
    'rich-text', 'generic-section', 'heading', 'card',
    'flip-trigger', 'grid-section', 'icon'
  ] as const

  // 3. Construct BlockProps
  const blocks: BlockProps[] = sections.map(section => {
    // Use preview version if this is the preview section, otherwise use published version
    const version = (previewSectionId && section.id === previewSectionId)
      ? previewVersion
      : versionMap.get(section.id)

    // Determine block type with proper fallback:
    // 1. Use layout_json.type if present
    // 2. Otherwise use slug if it's a known type
    // 3. Otherwise default to 'generic-section'
    let blockType: string = section.slug

    if (version?.layout_json?.type) {
      blockType = version.layout_json.type
    } else if (!knownBlockTypes.includes(section.slug as any)) {
      // Slug is not a known block type (e.g., 'section-73e1295c')
      // Default to generic-section
      blockType = 'generic-section'
    }

    // Prioritize layout_json.content if it exists and has items
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
      {previewVersionId && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none">
          <div className="bg-blue-600/20 border border-blue-500/20 backdrop-blur-md px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest text-blue-400 pointer-events-auto">
            Preview Mode
          </div>
        </div>
      )}
      <Navbar sections={sections} />
      {/* 
        Public view route - READ ONLY
        This is the ISR-cached published version.
        Edit mode is DISABLED.
      */}
      <PageBuilder initialBlocks={blocks} isEditMode={false} />
      <BackToEditButton />
    </main>
  )
}
