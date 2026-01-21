'use client'

import { BlockProps } from '@/components/blocks/types'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useEffect } from 'react'
import { KeyboardShortcuts } from './keyboard-shortcuts'

interface PageBuilderProps {
    initialBlocks: BlockProps[]
    isEditMode?: boolean // Default to false for safety
}

export function PageBuilder({ initialBlocks, isEditMode = false }: PageBuilderProps) {
    const { blocks, setBlocks, setEditMode } = useEditorStore()

    // Set edit mode based on prop
    useEffect(() => {
        setEditMode(isEditMode)
    }, [isEditMode, setEditMode])

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
