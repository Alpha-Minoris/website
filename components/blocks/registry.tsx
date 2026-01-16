import { BlockType } from './types'
import { HeroBlock } from './hero-block'
import { MissionBlock } from './mission-block'
import { ServicesBlock } from './services-block'
import { PackagesBlock } from './packages-block'
import { HowWeWorkBlock } from './how-we-work-block'
import { TeamBlock } from './team-block'
import { TestimonialsBlock } from './testimonials-block'
import { FAQBlock } from './faq-block'
import { ContactBlock } from './contact-block'
import { CaseStudyGridBlock } from './case-study-grid-block'
import { PlaceholderBlock } from './placeholder-block'
import { GenericSectionBlock } from './generic-section-block'
import { TextBlock } from './text-block'
import { CardBlock } from './card-block'
import { FlipTriggerBlock } from './flip-trigger-block'
import { GridSectionBlock } from './grid-section-block'
import { IconBlock } from './icon-block'
import { FooterBlock } from './footer-block'

export const BlockRegistry: Record<BlockType, React.ComponentType<any>> = {
    'hero': HeroBlock,
    'mission': MissionBlock,
    'services': ServicesBlock,
    'packages': PackagesBlock,
    'how-we-work': HowWeWorkBlock,
    'team': TeamBlock,
    'testimonials': TestimonialsBlock,
    'faq': FAQBlock,
    'contact': ContactBlock,
    'case-studies': CaseStudyGridBlock,
    'rich-text': PlaceholderBlock,
    'generic-section': GenericSectionBlock,
    'heading': TextBlock,
    'card': CardBlock,
    'flip-trigger': FlipTriggerBlock,
    'grid-section': GridSectionBlock,
    'icon': IconBlock,
    'footer': FooterBlock,
}
