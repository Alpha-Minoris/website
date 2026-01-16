import { createClient, createAdminClient } from '@/lib/supabase/server'
import { BlockProps, BlockType } from '@/components/blocks/types'
import { PageBuilder } from '@/components/editor/page-builder'
import { Navbar } from '@/components/layout/navbar'

export const revalidate = 0 // Disable caching for active editing

export default async function Home() {
  const isDev = process.env.NODE_ENV === 'development'
  // In Dev, use Admin client to bypass RLS so Anon users (Editor) can see hidden sections
  // In Prod, use standard User client which respects RLS (Public=Visible only, Auth=All)
  const supabase = isDev ? await createAdminClient() : await createClient()

  const user = await supabase.auth.getUser()
  const isAdmin = user.data.user?.role === 'authenticated' // Verify role properly if needed, simpler check for now if authenticated users are admins

  // 1. Fetch Sections
  // usage of AdminClient in dev ensures we get ALL sections (ignoring RLS 'enabled only' for anon).
  // usage of Client in prod ensures RLS enforces privacy.
  let query = supabase
    .from('website_sections')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: sections, error } = await query
  console.log(`[Page] User: ${!!user.data.user}, Sections fetched: ${sections?.length}`)
  if (sections) {
    console.log(`[Page] Section statuses:`, sections.map(s => `${s.slug}:${s.is_enabled}`))
  }

  if (error) {
    console.error('Error fetching sections:', error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading page content. Check logs.
      </div>
    )
  }

  // 2. Fetch Published Versions
  if (!sections || sections.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground selection:bg-accent/30">
        <Navbar sections={[]} />
        {/* <div className="p-10 text-center">No sections found.</div> */}
        <PageBuilder initialBlocks={[]} />
      </main>
    )
  }

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
      settings: version?.layout_json || {},
      is_enabled: section.is_enabled,
      title: section.title,
      slug: section.slug
    }

    return block
  })

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Navbar sections={sections} />
      {/* 
        This is the new PageBuilder that handles Editor wrappers.
        It accepts initialBlocks for hydration.
      */}
      <PageBuilder initialBlocks={blocks} />
    </main>
  )
}
