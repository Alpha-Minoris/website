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

export interface BlockProps {
    id: string
    type: BlockType
    content: any
    settings?: any
    sectionId?: string
}
