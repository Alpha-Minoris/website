import { BlockProps, BlockType } from '@/components/blocks/types'
import { PageBuilder } from '@/components/editor/page-builder'
import { Navbar } from '@/components/layout/navbar'
import { checkEditRights } from '@/lib/auth-utils'
import { getSections, getVersions } from '@/lib/cache/page-cache'

// PERFORMANCE: Enable page-level caching for 1 hour
// Production: Edit mode disabled → fully cacheable
// Localhost: Edit mode enabled → dynamic (no caching needed for dev)
export const revalidate = 3600

export default async function Home() {
  const canEdit = await checkEditRights({ actionType: 'update', path: '/' })

  // PERFORMANCE: Removed supabase client creation here
  // Client is now created inside getSections/getVersions based on canEdit flag
  // Production: createCacheCompatibleClient() - no cookies, enables caching
  // Localhost: createAdminClient() - with cookies, enables editing
  const isAdmin = canEdit

  // PERFORMANCE: Database calls are cached via page-level revalidate = 3600
  let sections
  let error
  try {
    sections = await getSections(canEdit)
    if (sections) {
      console.log(`[Page] Loaded ${sections.length} sections, canEdit: ${canEdit}`)
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
  const versions = await getVersions(sectionIds, canEdit)

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
      settings: version?.layout_json || {},
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
