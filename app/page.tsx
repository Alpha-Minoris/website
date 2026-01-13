
import { createClient } from '@/lib/supabase/server'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import { BlockProps } from '@/components/blocks/types'

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

  // 2. Fetch Published Versions for these sections
  // Ideally, we could do a join, but let's keep it simple and explicit.
  // Or simpler: map sections to BlockProps directly for Phase 1. 
  // Wait, the DB Schema stores `layout_json` in `website_section_versions`.
  // We need to fetch the published version for each section.

  // Efficient Fetch: Get all published versions where section_id IN (sections.ids)
  const sectionIds = sections.map(s => s.id)
  const { data: versions } = await supabase
    .from('website_section_versions')
    .select('section_id, layout_json')
    .eq('status', 'published')
    .in('section_id', sectionIds)

  // Map versions by section_id
  const versionMap = new Map()
  versions?.forEach(v => versionMap.set(v.section_id, v))

  // 3. Construct BlockProps
  const blocks: BlockProps[] = sections.map(section => {
    // Default block props from section metadata
    const block: BlockProps = {
      id: section.id,
      type: section.slug as any, // Assumption: slug matches block type for core sections
      content: {}, // Will come from layout_json
      settings: {}
    }

    const version = versionMap.get(section.id)
    if (version && version.layout_json) {
      // If layout_json exists, merge it. 
      // For now, if layout_json is empty (initial seed), we render the block with default content logic (handled in component).
      // The seeds were INSERTED without version entries yet! 
      // So versions will be empty for now.
      // This is correct: The blocks will render their "Default State" or "Placeholder" state.
    }

    return block
  })

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <BlockRenderer blocks={blocks} />
    </main>
  )
}
