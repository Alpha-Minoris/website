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
    | 'heading'

export interface BlockProps {
    id: string
    type: BlockType
    content: any
    settings?: any
    sectionId?: string
}
