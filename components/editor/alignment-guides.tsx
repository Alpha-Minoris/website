'use client'

import { SnapGuide } from '@/lib/hooks/use-snapping'

interface AlignmentGuidesProps {
    guides: SnapGuide[]
    sectionWidth: number
    sectionHeight: number
}

/**
 * Renders alignment guides (lines) when components snap to edges or centers
 */
export function AlignmentGuides({ guides, sectionWidth, sectionHeight }: AlignmentGuidesProps) {
    if (guides.length === 0) return null

    return (
        <div className="absolute inset-0 pointer-events-none z-[100]">
            <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                {guides.map((guide, i) => {
                    const color = guide.type === 'center'
                        ? '#ec4899' // Pink for center
                        : guide.type === 'grid'
                            ? '#60a5fa' // Blue for grid
                            : '#22c55e' // Green for edges

                    const dashArray = guide.type === 'grid' ? '4,4' : 'none'

                    if (guide.orientation === 'vertical') {
                        return (
                            <line
                                key={`v-${i}`}
                                x1={guide.position}
                                y1={0}
                                x2={guide.position}
                                y2={sectionHeight}
                                stroke={color}
                                strokeWidth={1}
                                strokeDasharray={dashArray}
                            />
                        )
                    } else {
                        return (
                            <line
                                key={`h-${i}`}
                                x1={0}
                                y1={guide.position}
                                x2={sectionWidth}
                                y2={guide.position}
                                stroke={color}
                                strokeWidth={1}
                                strokeDasharray={dashArray}
                            />
                        )
                    }
                })}
            </svg>
        </div>
    )
}
