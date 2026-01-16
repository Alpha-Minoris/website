import React from 'react'
import { BlockProps } from './types'
import { BlockRegistry } from './registry'
import { EditorBlockWrapper } from '@/components/editor/editor-block-wrapper'
import { cn } from '@/lib/utils'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

interface BlockRendererProps {
    blocks: BlockProps[]
    sectionId?: string
    layoutMode?: 'flow' | 'canvas'
}

export function BlockRenderer({ blocks, sectionId, layoutMode = 'flow' }: BlockRendererProps) {
    if (!blocks || !Array.isArray(blocks)) {
        return null
    }

    const renderBlocks = (list: BlockProps[]) => {
        return list.map((block) => {
            const Component = BlockRegistry[block.type]

            if (!Component) {
                console.warn(`Block type "${block.type}" not found in registry.`)
                return null
            }

            const isContentBlock = ['heading', 'paragraph', 'button', 'card', 'flip-trigger', 'icon'].includes(block.type)
            const isFooter = block.type === 'footer' || block.slug === 'footer'

            // In Canvas mode, we strictly avoid wrapping in <section> or other layout-affecting elements
            // The EditorBlockWrapper handles absolute positioning directly.
            const Wrapper = layoutMode === 'canvas' ? React.Fragment : (isFooter ? 'footer' : 'section')

            // For footer, maybe we don't want 'w-full relative' if it messes up? 
            // Actually footer-block has the footer tag. So Wrapper can be a div or Fragment?
            // Existing `section` wrapper gives it an ID.
            const wrapperProps = layoutMode === 'canvas' ? {} : {
                id: block.slug || block.id,
                className: "w-full relative",
                "data-block-type": block.type
            }

            return (
                <Wrapper key={block.id} {...wrapperProps}>
                    <EditorBlockWrapper
                        blockId={block.id}
                        blockType={block.type}
                        className={layoutMode === 'flow' ? (isContentBlock ? "w-fit mx-auto" : "w-full") : ""}
                        settings={block.settings}
                        sectionId={sectionId}
                        layoutMode={layoutMode}
                    >
                        <Component {...block} sectionId={sectionId} />
                    </EditorBlockWrapper>
                </Wrapper>
            )
        })
    }

    if (layoutMode === 'canvas') {
        return (
            <div className="w-full h-full relative">
                {renderBlocks(blocks)}
            </div>
        )
    }

    // Split blocks: Main content vs Fixed (Footer)
    const footerBlock = blocks.find(b => b.type === 'footer' || b.slug === 'footer')
    const mainBlocks = blocks.filter(b => b.type !== 'footer' && b.slug !== 'footer')

    return (
        <div className="flex flex-col w-full">
            <SortableContext
                items={mainBlocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
            >
                {renderBlocks(mainBlocks)}
            </SortableContext>

            {/* Render Footer outside sortable context = Immovable */}
            {footerBlock && renderBlocks([footerBlock])}
        </div>
    )
}
