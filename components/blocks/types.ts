export type BlockType =
    | 'hero'
    | 'mission'
    | 'services'
    | 'packages'
    | 'how-we-work'
    | 'team'
    | 'testimonials'
    | 'faq'
    | 'contact'
    | 'case-studies'
    | 'rich-text' // generic fallback
    | 'generic-section'
    | 'grid-section' // New Responsive Grid
    | 'heading'
    | 'card'
    | 'flip-trigger'
    | 'icon'
    | 'footer'

export interface BlockProps {
    id: string
    type: BlockType
    content?: any
    is_enabled?: boolean
    title?: string
    sectionId?: string
    slug?: string
    sectionSlug?: string

    // Allow any other flat properties
    [key: string]: any
}
