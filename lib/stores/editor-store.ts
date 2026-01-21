import { create } from 'zustand'
import { BlockProps } from '@/components/blocks/types'
import { updateBlock as updateBlockServer } from '@/actions/block-actions'

interface EditorState {
    isEditMode: boolean
    selectedBlockId: string | null
    activeDragId: string | null
    blocks: BlockProps[]
    originalBlocks: BlockProps[]  // Store original blocks for discard

    toggleEditMode: () => void
    setEditMode: (enabled: boolean) => void
    setSelectedBlockId: (id: string | null) => void
    setActiveDragId: (id: string | null) => void
    setBlocks: (blocks: BlockProps[]) => void
    resetToOriginal: () => void  // Reset blocks to original state (discard changes)

    addBlock: (block: BlockProps) => void
    removeBlock: (id: string) => void
    updateBlock: (id: string, updates: Partial<BlockProps>) => void
    moveBlock: (id: string, direction: 'up' | 'down') => void

    // History
    history: BlockProps[][]
    historyIndex: number
    saveTimeout: NodeJS.Timeout | null
    undo: () => void
    redo: () => void
    pushToHistory: (blocks: BlockProps[]) => void

    // Save Management
    dirtyBlockIds: Set<string>
    autoSaveEnabled: boolean
    saveInProgress: boolean
    lastSavedAt: Date | null
    toggleAutoSave: () => void
    saveToServer: () => Promise<void>

    // Version Manager
    isVersionManagerOpen: boolean
    setIsVersionManagerOpen: (open: boolean) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
    isEditMode: false,
    selectedBlockId: null,
    activeDragId: null,
    blocks: [],
    originalBlocks: [],  // Store original blocks for discard functionality

    // Save Management State
    dirtyBlockIds: new Set<string>(),
    autoSaveEnabled: true,  // Default: auto-save ON
    saveInProgress: false,
    lastSavedAt: null,

    // Version Manager State
    isVersionManagerOpen: false,

    toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
    setEditMode: (enabled: boolean) => set({ isEditMode: enabled }),
    setSelectedBlockId: (id) => set({ selectedBlockId: id }),
    setActiveDragId: (id) => set({ activeDragId: id }),
    setBlocks: (blocks) => set((state) => {
        // With new save strategy, blocks from DB should ALWAYS be clean
        // Server filters metadata and flattens settings on save
        // No need for complex recursive cleanup logic anymore

        // Simple validation to ensure required fields exist
        const validatedBlocks = blocks.map(block => ({
            ...block,
            id: block.id || crypto.randomUUID(), // Fallback if missing
            type: block.type || 'generic-section',  // Fallback if missing
            content: block.content || []  // Ensure content array exists
        }))

        console.log(`[setBlocks] Loaded ${validatedBlocks.length} blocks (no cleanup needed with new save strategy)`)

        state.pushToHistory(validatedBlocks)

        // CRITICAL: Deep copy to prevent mutations from affecting originalBlocks
        const originalCopy = JSON.parse(JSON.stringify(validatedBlocks))

        return {
            blocks: validatedBlocks,
            originalBlocks: originalCopy  // Store deep copy for discard
        }
    }),

    resetToOriginal: () => set((state) => {
        console.log('[resetToOriginal] Restoring original blocks, discarding changes')
        // Clear dirty blocks
        state.dirtyBlockIds.clear()
        // Reset to original
        state.pushToHistory(state.originalBlocks)
        return { blocks: state.originalBlocks }
    }),

    addBlock: (block: BlockProps) => set((state) => ({
        blocks: [...state.blocks, block]
    })),
    removeBlock: (id: string) => set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== id),
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
    })),
    // Recursive update helper
    updateBlock: (id: string, updates: Partial<BlockProps>) => set((state) => {
        const updateRecursive = (blocks: BlockProps[]): BlockProps[] => {
            return blocks.map((block) => {
                if (block.id === id) {
                    // Replace entire block with updates - blocks are FLAT, no settings wrapper
                    return { ...block, ...updates }
                }
                // Recurse into content
                if (Array.isArray(block.content)) {
                    return { ...block, content: updateRecursive(block.content as BlockProps[]) }
                }
                return block
            })
        }
        const newBlocks = updateRecursive(state.blocks)
        state.pushToHistory(newBlocks)

        // Mark this block as dirty
        const newDirtyIds = new Set(state.dirtyBlockIds)
        newDirtyIds.add(id)

        console.log(`[updateBlock] Updated ${id}, marked dirty`)

        return { blocks: newBlocks, dirtyBlockIds: newDirtyIds }
    }),
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

    // History Implementation
    history: [],
    historyIndex: -1,
    saveTimeout: null,

    pushToHistory: (blocks) => set((state) => {
        // Clear any pending snapshot
        if (state.saveTimeout) clearTimeout(state.saveTimeout)

        const timeout = setTimeout(() => {
            const currentState = useEditorStore.getState()

            // Deep equality check before pushing
            const lastSnapshot = currentState.history[currentState.historyIndex]
            const blocksJson = JSON.stringify(blocks)
            const lastJson = lastSnapshot ? JSON.stringify(lastSnapshot) : ''

            if (blocksJson === lastJson) {
                set({ saveTimeout: null })
                return
            }

            set((nextState) => {
                const newHistory = nextState.history.slice(0, nextState.historyIndex + 1)
                newHistory.push(JSON.parse(blocksJson))

                // Limit history to 50 items
                if (newHistory.length > 50) newHistory.shift()

                return {
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                    saveTimeout: null
                }
            })
        }, 1000) // 1s debounce - long enough to avoid typing lag

        return { saveTimeout: timeout }
    }),

    undo: () => set((state) => {
        if (state.historyIndex <= 0) return state
        const prevIndex = state.historyIndex - 1
        return {
            blocks: JSON.parse(JSON.stringify(state.history[prevIndex])),
            historyIndex: prevIndex
        }
    }),

    redo: () => set((state) => {
        if (state.historyIndex >= state.history.length - 1) return state
        const nextIndex = state.historyIndex + 1
        return {
            blocks: JSON.parse(JSON.stringify(state.history[nextIndex])),
            historyIndex: nextIndex
        }
    }),

    // Save Management Functions
    toggleAutoSave: () => set((state) => ({
        autoSaveEnabled: !state.autoSaveEnabled
    })),

    saveToServer: async () => {
        const state = get()

        console.log('[SaveToServer] Called with:', {
            saveInProgress: state.saveInProgress,
            dirtyBlockCount: state.dirtyBlockIds.size,
            dirtyBlockIds: Array.from(state.dirtyBlockIds),
            totalBlocks: state.blocks.length
        })

        // Guard: already saving
        if (state.saveInProgress) {
            console.log('[SaveToServer] Already saving, skipping')
            return
        }

        // Guard: no dirty blocks
        if (state.dirtyBlockIds.size === 0) {
            console.log('[SaveToServer] No dirty blocks, skipping')
            return
        }

        set({ saveInProgress: true })
        console.log('[SaveToServer] Starting save process...')

        try {
            // Save each dirty block to database SEQUENTIALLY to avoid race conditions
            const dirtyIds = Array.from(state.dirtyBlockIds)
            console.log(`[SaveToServer] Processing ${dirtyIds.length} dirty blocks SEQUENTIALLY`)

            const results = []
            for (const blockId of dirtyIds) {
                const block = state.blocks.find(b => b.id === blockId)
                if (!block) {
                    console.warn(`[SaveToServer] Block ${blockId} not found in store`)
                    continue
                }

                console.log(`[SaveToServer] Saving ${block.slug} - sending exact block`)

                // Send EXACT block to server - no transformations
                const result = await updateBlockServer(blockId, block)

                console.log(`[SaveToServer] ${block.slug} saved successfully`)
                results.push(result)
            }

            console.log('[SaveToServer] All blocks saved successfully:', results)

            // Clear dirty state on success
            set({
                dirtyBlockIds: new Set(),
                lastSavedAt: new Date(),
                saveInProgress: false
            })

            console.log('[SaveToServer] Save complete, dirty state cleared')
        } catch (error) {
            console.error('[SaveToServer] Save failed with error:', error)
            set({ saveInProgress: false })
            throw error
        }
    },

    // Version Manager Actions
    setIsVersionManagerOpen: (open: boolean) => set({ isVersionManagerOpen: open }),
}))

// Auto-save watcher (5s debounce)
let saveTimer: NodeJS.Timeout | null = null

useEditorStore.subscribe((state) => {
    // Only auto-save if:
    // 1. Auto-save is enabled
    // 2. There are dirty blocks
    // 3. Not currently saving
    if (state.autoSaveEnabled && state.dirtyBlockIds.size > 0 && !state.saveInProgress) {
        // Clear existing timer
        if (saveTimer) clearTimeout(saveTimer)

        // Start 5s countdown
        saveTimer = setTimeout(() => {
            console.log('[AutoSave] Triggering auto-save after 5s...')
            useEditorStore.getState().saveToServer()
        }, 5000)  // 5 seconds
    }
})
