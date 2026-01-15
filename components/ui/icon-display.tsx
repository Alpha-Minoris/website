'use client'

import { RefreshCw } from "lucide-react"
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { lazy, Suspense, useMemo } from 'react'

export const IconDisplay = ({ name, className, style }: { name?: string, className?: string, style?: any }) => {
    const LucideIcon = useMemo(() => {
        if (!name) return null
        const icon = dynamicIconImports[name as keyof typeof dynamicIconImports]
        if (!icon) return null
        return lazy(icon)
    }, [name])

    if (!name || !LucideIcon) return <RefreshCw className={className} style={style} />

    return (
        <Suspense fallback={<div className={className} style={style} />}>
            <LucideIcon className={className} style={style} />
        </Suspense>
    )
}
