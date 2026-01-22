'use client'

import React from 'react'
import { BlockProps } from '@/components/blocks/types'
import { FloatingToolbar } from './floating-toolbar'
import { TextToolbar } from './text-toolbar'
import { CardToolbar } from './card-toolbar'
import { IconToolbar } from './icon-toolbar'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'

interface BlockToolbarsProps {
    block: BlockProps
    isSelected: boolean
    sectionId?: string
}

export function BlockToolbars({ block, isSelected, sectionId }: BlockToolbarsProps) {
    const { updateBlock } = useEditorStore()

    if (!isSelected) return null

    const isContentBlock = ['heading', 'paragraph', 'button', 'rich-text'].includes(block.type)
    const isCardBlock = block.type === 'card'
    const isIconBlock = block.type === 'icon'
    const isFooter = block.type === 'footer'

    return (
        <>
            {/* General Floating Toolbar for section blocks */}
            {!isContentBlock && !isCardBlock && !isIconBlock && !isFooter && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[9999]">
                    <FloatingToolbar id={block.id} />
                </div>
            )}

            {/* Text Toolbar for content blocks */}
            {isContentBlock && (
                <div
                    className={cn(
                        "absolute left-1/2 -translate-x-1/2 z-50 cursor-default",
                        isFooter ? "top-0 -translate-y-full pb-2" : "top-full pt-2"
                    )}
                    onPointerDown={e => e.stopPropagation()}
                >
                    <TextToolbar blockId={block.id} />
                </div>
            )}

            {/* Card Toolbar */}
            {isCardBlock && sectionId && (
                <CardToolbar blockId={block.id} sectionId={sectionId} block={block} />
            )}

            {/* Icon Toolbar */}
            {isIconBlock && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 cursor-default" onPointerDown={e => e.stopPropagation()}>
                    <IconToolbar
                        block={block}
                        onUpdate={(updates: any) => {
                            const newBlock = { ...block, ...updates }
                            useEditorStore.getState().updateBlock(block.id, newBlock)
                            import('@/actions/block-actions').then(({ updateBlockContent }) => {
                                updateBlockContent(sectionId || block.id, block.id, newBlock)
                            })
                        }}
                        onDelete={() => { }}
                    />
                </div>
            )}
        </>
    )
}
