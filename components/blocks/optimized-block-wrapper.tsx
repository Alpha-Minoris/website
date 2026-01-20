'use client'

import { useInView } from 'react-intersection-observer'
import { ReactNode } from 'react'

interface OptimizedBlockWrapperProps {
    children: ReactNode
    blockId: string
    minHeight?: string
}

/**
 * Optimizes block rendering for mobile Safari and performance
 * Only renders content when block is in or near viewport
 * Prevents blank spaces during fast scrolling
 */
export function OptimizedBlockWrapper({
    children,
    blockId,
    minHeight = '400px'
}: OptimizedBlockWrapperProps) {
    const { ref, inView } = useInView({
        triggerOnce: true, // Only trigger once, keep rendered after first view
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '100px' // Load 100px before entering viewport
    })

    return (
        <div
            ref={ref}
            data-block-id={blockId}
            style={{
                minHeight: inView ? 'auto' : minHeight,
                // GPU acceleration hints
                transform: 'translateZ(0)',
                willChange: inView ? 'auto' : 'transform'
            }}
        >
            {inView ? children : (
                // Placeholder while not in view
                <div
                    style={{
                        minHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.3
                    }}
                >
                    {/* Empty placeholder - content will load when scrolled into view */}
                </div>
            )}
        </div>
    )
}
