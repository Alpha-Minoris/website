import { createClient } from '@/lib/supabase/server'
import { BlockProps, BlockType } from '@/components/blocks/types'
import { PageBuilder } from '@/components/editor/page-builder'

export const revalidate = 60 // Revalidate every minute for now

export default async function Home() {
  const supabase = await createClient()

  // 1. Fetch Enabled Sections
  const { data: sections, error } = await supabase
    .from('website_sections')
    .select('*')
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching sections:', error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading page content. Check logs.
      </div>
    )
  }

  // 2. Fetch Published Versions
  const sectionIds = sections.map(s => s.id)
  const { data: versions } = await supabase
    .from('website_section_versions')
    .select('section_id, layout_json')
    .eq('status', 'published')
    .in('section_id', sectionIds)

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
      settings: version?.layout_json || {}
    }

    return block
  })

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      {/* 
        This is the new PageBuilder that handles Editor wrappers.
        It accepts initialBlocks for hydration.
      */}
      <PageBuilder initialBlocks={blocks} />
    </main>
  )
}
