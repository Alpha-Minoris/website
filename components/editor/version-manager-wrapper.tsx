'use client'

import { useEditorStore } from '@/lib/stores/editor-store'
import { VersionManager } from './version-manager'

export default function VersionManagerWrapper() {
    const isVersionManagerOpen = useEditorStore(state => state.isVersionManagerOpen)
    const setIsVersionManagerOpen = useEditorStore(state => state.setIsVersionManagerOpen)

    return (
        <VersionManager
            isOpen={isVersionManagerOpen}
            onClose={() => setIsVersionManagerOpen(false)}
        />
    )
}
