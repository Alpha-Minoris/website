'use client'

import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'
import { MissionAnimation } from './mission-animation'

interface Feature {
    title: string
    description: string
    icon: string
    asset?: {
        type: 'icon' | 'image'
        value: string
        linkUrl?: string
        isHidden?: boolean
        color?: string
        size?: number
        maskSettings?: any
    }
}

interface Missionblock {
    title: string
    description: string
    features: Feature[]
    visualText?: string
    align?: 'left' | 'center' | 'right'
    fontFamily?: string
    fontSize?: string
    color?: string
    level?: 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'label' | 'p' | 'span'
}

export function MissionBlock(block: BlockProps) {
    const { id, slug } = block
    const folder = slug
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Default Data
    const defaultData: Missionblock = {
        title: 'We bridge the gap between <span class="text-accent">Human Strategy</span> and <span class="text-accent">AI Execution</span>.',
        description: 'Most businesses are drowning in manual tasks while AI tools sit unused. We don\'t just "install AI" — we architect intelligent workflows that free your team to focus on what matters.',
        features: [
            {
                title: 'Strategic Implementation',
                description: 'We analyze your bottlenecks before writing a single line of code.',
                icon: 'CheckCircle'
            },
            {
                title: 'Future-Proof Architecture',
                description: 'Built on scalable frameworks that grow with your business.',
                icon: 'CheckCircle'
            }
        ],
        visualText: 'MISSION'
    }

    // Local state
    const [localBlock, setlocalBlock] = useState<Missionblock>({ ...defaultData, ...block })

    // Use ref to always get latest state (fixes stale closure in saveBlock)
    const localBlockRef = useRef(localBlock)
    useEffect(() => {
        localBlockRef.current = localBlock
    }, [localBlock])

    // Sync from props
    useEffect(() => {
        if (block) {
            setlocalBlock((prev: any) => ({ ...prev, ...block }))
        }
    }, [block])

    const saveBlock = useCallback((newblock: Missionblock) => {
        setlocalBlock(newblock)
        localBlockRef.current = newblock
        updateBlock(id, newblock as any)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        const currentBlock = localBlockRef.current
        saveBlock({ ...currentBlock, [key]: value })
    }, [saveBlock])

    const handleFeatureChange = useCallback((index: number, updates: Partial<Feature>) => {
        const currentBlock = localBlockRef.current
        const features = [...(currentBlock.features || [])]
        features[index] = { ...features[index], ...updates }
        saveBlock({ ...currentBlock, features })
    }, [saveBlock])

    const handleAddFeature = () => {
        const currentBlock = localBlockRef.current
        const features = [...(currentBlock.features || []), { title: 'New Feature', description: 'Feature description', icon: 'CheckCircle' }]
        saveBlock({ ...currentBlock, features })
    }

    const handleRemoveFeature = (index: number) => {
        const currentBlock = localBlockRef.current
        const features = [...(currentBlock.features || [])]
        features.splice(index, 1)
        saveBlock({ ...currentBlock, features })
    }

    const onTextFocus = useCallback((rect: DOMRect) => {
        if (sectionRef.current) {
            const sectionRect = sectionRef.current.getBoundingClientRect()
            const relativeLeft = rect.left - sectionRect.left + (rect.width / 2)
            // Position toolbar below the text block (using rect.bottom)
            const relativeTop = rect.bottom - sectionRect.top
            setActiveToolbarPos({ top: relativeTop, left: relativeLeft })
        }
    }, [])

    const onTextBlur = useCallback(() => {
        setTimeout(() => {
            const activeEl = document.activeElement
            const inPortal = activeEl?.closest('[data-radix-portal]') ||
                activeEl?.closest('[role="dialog"]') ||
                activeEl?.closest('[role="listbox"]') ||
                activeEl?.closest('[data-radix-popper-content-wrapper]')

            if (!sectionRef.current?.contains(activeEl) && !inPortal) {
                setActiveToolbarPos(null)
            }
        }, 200)
    }, [])

    const handleMissionClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            if (e.target === e.currentTarget) {
                setActiveToolbarPos(null)
            }
        }
    }, [isEditMode])

    return (
        <section
            id={id}
            ref={sectionRef}
            onClickCapture={handleMissionClick}
            className="py-24 bg-transparent relative overflow-hidden"
        >
            {/* Local Toolbar */}
            {isEditMode && activeToolbarPos && (
                <div
                    className="absolute z-50 transition-all duration-100"
                    style={{ top: activeToolbarPos.top, left: activeToolbarPos.left, transform: 'translateY(-10px)' }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <TextToolbar blockId={id} />
                </div>
            )}

            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                {/* Left: Text */}
                <div className={cn(
                    "space-y-8",
                    localBlock.align === 'left' ? "text-left items-start" :
                        localBlock.align === 'right' ? "text-right items-end" :
                            "text-center md:text-left items-center md:items-start"
                )}>
                    <EditableText
                        tagName={localBlock.level || 'h2'}
                        value={localBlock.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-4xl md:text-5xl font-bold font-heading"
                        style={{
                            fontFamily: localBlock.fontFamily,
                            fontSize: localBlock.fontSize,
                            color: localBlock.color
                        }}
                    />

                    <div className={cn(
                        "space-y-6 text-lg text-muted-foreground leading-relaxed",
                        localBlock.align === 'center' ? "mx-auto" : ""
                    )}>
                        <EditableText
                            tagName="p"
                            value={localBlock.description}
                            onChange={(v) => handleTextChange('description', v)}
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localBlock.fontFamily,
                                fontSize: localBlock.fontSize,
                                color: localBlock.color
                            }}
                        />

                        <div className="grid gap-4 pt-4">
                            {localBlock.features?.map((feature: Feature, i: number) => (
                                <div key={i} className="flex items-start gap-3 group relative">
                                    <EditableAsset
                                        type={feature.asset?.type || 'icon'}
                                        value={feature.asset?.value || 'CheckCircle'}
                                        onChange={(type: 'icon' | 'image', value: string) => handleFeatureChange(i, { asset: { ...feature.asset, type, value } })}
                                        onUpdate={(updates) => handleFeatureChange(i, { asset: { ...feature.asset, ...updates } })}
                                        isEditMode={isEditMode}
                                        linkUrl={feature.asset?.linkUrl}
                                        isHidden={feature.asset?.isHidden}
                                        color={feature.asset?.color}
                                        size={feature.asset?.size}
                                        maskSettings={feature.asset?.maskSettings}
                                        folder={folder}
                                        className="w-10 h-10 border-none shrink-0"
                                        iconClassName="w-full h-full text-accent"
                                    />
                                    <div className="flex-1">
                                        <EditableText
                                            tagName="h4"
                                            value={feature.title}
                                            onChange={(v) => handleFeatureChange(i, { title: v })}
                                            isEditMode={isEditMode}
                                            onFocus={onTextFocus}
                                            onBlur={onTextBlur}
                                            className="text-white font-semibold"
                                            style={{
                                                fontFamily: localBlock.fontFamily,
                                                fontSize: localBlock.fontSize,
                                                color: localBlock.color
                                            }}
                                        />
                                        <EditableText
                                            tagName="p"
                                            value={feature.description}
                                            onChange={(v) => handleFeatureChange(i, { description: v })}
                                            isEditMode={isEditMode}
                                            onFocus={onTextFocus}
                                            onBlur={onTextBlur}
                                            className="text-sm"
                                            style={{
                                                fontFamily: localBlock.fontFamily,
                                                fontSize: localBlock.fontSize,
                                                color: localBlock.color
                                            }}
                                        />
                                    </div>
                                    <DeleteButton
                                        onClick={() => handleRemoveFeature(i)}
                                        isEditMode={isEditMode}
                                        className="absolute -left-8 top-0"
                                    />
                                </div>
                            ))}
                            <AddButton onClick={handleAddFeature} isEditMode={isEditMode} className="w-fit" />
                        </div>
                    </div>
                </div>

                {/* Right: Abstract Visual */}
                <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full opacity-20"></div>
                    <div className="relative h-[400px] md:h-[600px] w-full bg-white/5 border border-white/10 backdrop-blur-3xl rounded-3xl flex items-center justify-center overflow-hidden">
                        {/* Abstract Animation */}
                        <MissionAnimation />
                    </div>
                </div>
            </div>
        </section>
    )
}




