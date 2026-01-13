import React from 'react'
import { BlockProps } from './types'
import { BlockRegistry } from './registry'

interface BlockRendererProps {
    blocks: BlockProps[]
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
    if (!blocks || !Array.isArray(blocks)) {
        return null
    }

    return (
        <div className="flex flex-col w-full">
            {blocks.map((block) => {
                const Component = BlockRegistry[block.type]

                if (!Component) {
                    console.warn(`Block type "${block.type}" not found in registry.`)
                    return null
                }

                return (
                    <section id={block.id} key={block.id} className="w-full relative">
                        <Component {...block} />
                    </section>
                )
            })}
        </div>
    )
}
