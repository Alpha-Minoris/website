'use client'

import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Floating "Back to Edit" button for /view route
 * Only visible on localhost for easy navigation back to edit mode
 */
export function BackToEditButton() {
    const router = useRouter()
    const [isLocalhost, setIsLocalhost] = useState(false)

    useEffect(() => {
        const host = window.location.hostname
        setIsLocalhost(host === 'localhost' || host === '127.0.0.1')
    }, [])

    if (!isLocalhost) return null

    return (
        <button
            onClick={() => router.push('/edit')}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
            aria-label="Back to Edit Mode"
        >
            <Pencil className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Edit</span>
        </button>
    )
}
