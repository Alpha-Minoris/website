import { create } from 'zustand'
import { BlockProps } from '@/components/blocks/types'
import { updateBlock as updateBlockServer } from '@/actions/block-actions'

interface EditorState {
    isEditMode: boolean
    selectedBlockId: string | null
    activeDragId: string | null
    blocks: BlockProps[]

    toggleEditMode: () => void
    setEditMode: (enabled: boolean) => void
    setSelectedBlockId: (id: string | null) => void
    setActiveDragId: (id: string | null) => void
    setBlocks: (blocks: BlockProps[]) => void

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
}

export const useEditorStore = create<EditorState>((set, get) => ({
    isEditMode: false,
    selectedBlockId: null,
    activeDragId: null,
    blocks: [],

    // Save Management State
    dirtyBlockIds: new Set<string>(),
    autoSaveEnabled: true,  // Default: auto-save ON
    saveInProgress: false,
    lastSavedAt: null,

    toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
    setEditMode: (enabled: boolean) => set({ isEditMode: enabled }),
    setSelectedBlockId: (id) => set({ selectedBlockId: id }),
    setActiveDragId: (id) => set({ activeDragId: id }),
    setBlocks: (blocks) => set((state) => {
        state.pushToHistory(blocks)
        return { blocks }
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
                    // Update target block
                    // Merge settings deeply if needed, but for now shallow merge of top props
                    // Special handling for settings merge?
                    const newSettings = updates.settings ? { ...block.settings, ...updates.settings } : block.settings
                    return { ...block, ...updates, settings: newSettings }
                }
                // Recurse into content
                if (Array.isArray(block.content)) {
                    // If content is BlockProps[], recurse.
                    // Note: content might be string (html) for some blocks via mismatch, but usually array for containers.
                    // The type says BlockProps[].
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
            // Save each dirty block to database
            const dirtyIds = Array.from(state.dirtyBlockIds)
            console.log(`[SaveToServer] Processing ${dirtyIds.length} dirty blocks`)

            const savePromises = dirtyIds.map(async (blockId) => {
                const block = state.blocks.find(b => b.id === blockId)
                if (!block) {
                    console.warn(`[SaveToServer] Block ${blockId} not found in store`)
                    return
                }

                console.log(`[SaveToServer] Saving block ${blockId}:`, {
                    type: block.type,
                    hasContent: !!block.content,
                    hasSettings: !!block.settings
                })

                // Save to database (creates draft version)
                const result = await updateBlockServer(blockId, {
                    settings: block.settings,
                    content: block.content
                })

                console.log(`[SaveToServer] Block ${blockId} saved successfully:`, result)
                return result
            })

            const results = await Promise.all(savePromises)
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
