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

    const renderBlocks = () => {
        return blocks.map((block) => {
            const Component = BlockRegistry[block.type]

            if (!Component) {
                console.warn(`Block type "${block.type}" not found in registry.`)
                return null
            }

            const isContentBlock = ['heading', 'paragraph', 'button', 'card', 'flip-trigger', 'icon'].includes(block.type)

            // In Canvas mode, we strictly avoid wrapping in <section> or other layout-affecting elements
            // The EditorBlockWrapper handles absolute positioning directly.
            const Wrapper = layoutMode === 'canvas' ? React.Fragment : 'section'
            const wrapperProps = layoutMode === 'canvas' ? {} : {
                id: block.id,
                className: "w-full relative"
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
                {renderBlocks()}
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full">
            <SortableContext
                items={blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
            >
                {renderBlocks()}
            </SortableContext>
        </div>
    )
}
