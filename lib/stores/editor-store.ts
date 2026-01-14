import { create } from 'zustand'
import { BlockProps } from '@/components/blocks/types'

interface EditorState {
    isEditMode: boolean
    selectedBlockId: string | null
    blocks: BlockProps[]

    toggleEditMode: () => void
    setSelectedBlockId: (id: string | null) => void
    setBlocks: (blocks: BlockProps[]) => void

    addBlock: (block: BlockProps) => void
    removeBlock: (id: string) => void
    moveBlock: (id: string, direction: 'up' | 'down') => void
}

export const useEditorStore = create<EditorState>((set) => ({
    isEditMode: false,
    selectedBlockId: null,
    blocks: [],

    toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
    setSelectedBlockId: (id) => set({ selectedBlockId: id }),
    setBlocks: (blocks) => set({ blocks }),

    addBlock: (block: BlockProps) => set((state) => ({
        blocks: [...state.blocks, block]
    })),
    removeBlock: (id: string) => set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== id),
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
    })),
    moveBlock: (id: string, direction: 'up' | 'down') => set((state) => {
        const index = state.blocks.findIndex((b) => b.id === id)
        if (index === -1) return state

        const newBlocks = [...state.blocks]
        if (direction === 'up' && index > 0) {
            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]]
        } else if (direction === 'down' && index < state.blocks.length - 1) {
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]]
        }

        return { blocks: newBlocks }
    }),
}))
