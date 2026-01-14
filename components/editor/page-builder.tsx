'use client'

import { BlockProps } from '@/components/blocks/types'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useEffect } from 'react'
import { KeyboardShortcuts } from './keyboard-shortcuts'

interface PageBuilderProps {
    initialBlocks: BlockProps[]
}

export function PageBuilder({ initialBlocks }: PageBuilderProps) {
    const { blocks, setBlocks } = useEditorStore()

    // Sync initial blocks to store
    useEffect(() => {
        setBlocks(initialBlocks)
    }, [initialBlocks, setBlocks])

    // Use store blocks if available (client-side state), otherwise prop blocks
    const renderBlocks = blocks.length > 0 ? blocks : initialBlocks

    return (
        <div className="flex flex-col w-full min-h-screen">
            <KeyboardShortcuts />
            <BlockRenderer blocks={renderBlocks} />
        </div>
    )
}
