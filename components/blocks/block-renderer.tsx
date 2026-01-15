import React from 'react'
import { BlockProps } from './types'
import { BlockRegistry } from './registry'
import { EditorBlockWrapper } from '@/components/editor/editor-block-wrapper'
import { cn } from '@/lib/utils'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

interface BlockRendererProps {
    blocks: BlockProps[]
    sectionId?: string
}

export function BlockRenderer({ blocks, sectionId }: BlockRendererProps) {
    if (!blocks || !Array.isArray(blocks)) {
        return null
    }

    return (
        <div className="flex flex-col w-full">
            <SortableContext
                items={blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
            >
                {blocks.map((block) => {
                    const Component = BlockRegistry[block.type]

                    if (!Component) {
                        console.warn(`Block type "${block.type}" not found in registry.`)
                        return null
                    }

                    const isContentBlock = ['heading', 'paragraph', 'button', 'card', 'flip-trigger', 'icon'].includes(block.type)

                    return (
                        <section
                            id={block.id}
                            key={block.id}
                            className="w-full relative"
                        >
                            <EditorBlockWrapper
                                blockId={block.id}
                                blockType={block.type}
                                className={isContentBlock ? "w-fit mx-auto" : "w-full"}
                                settings={block.settings}
                                sectionId={sectionId}
                            >
                                <Component {...block} sectionId={sectionId} />
                            </EditorBlockWrapper>
                        </section>
                    )
                })}
            </SortableContext>
        </div>
    )
}
