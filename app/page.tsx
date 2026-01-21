import { BlockProps, BlockType } from '@/components/blocks/types'
import { PageBuilder } from '@/components/editor/page-builder'
import { Navbar } from '@/components/layout/navbar'
import { getSections, getVersions } from '@/lib/cache/page-cache'

// PUBLIC ROUTE: ISR with on-demand revalidation
// Static generation with 1-hour cache, invalidated on publish
// Editing happens at /edit route
export const revalidate = 60 // ISR: regenerate every 60 seconds OR on revalidatePath

export default async function Home() {
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
        <PageBuilder initialBlocks={[]} />
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
    const version = versionMap.get(section.id)

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
      <Navbar sections={sections} />
      {/* 
        This is the new PageBuilder that handles Editor wrappers.
        It accepts initialBlocks for hydration.
      */}
      <PageBuilder initialBlocks={blocks} />
    </main>
  )
}
