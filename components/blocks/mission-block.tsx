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

interface MissionSettings {
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

export function MissionBlock({ id, settings, sectionSlug, slug }: BlockProps) {
    const folder = sectionSlug || slug
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Default Data
    const defaultData: MissionSettings = {
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
    const [localSettings, setLocalSettings] = useState<MissionSettings>({ ...defaultData, ...settings })

    // Sync from props
    useEffect(() => {
        if (settings) {
            setLocalSettings((prev: any) => ({ ...prev, ...settings }))
        }
    }, [settings])

    const saveSettings = useCallback((newSettings: MissionSettings) => {
        setLocalSettings(newSettings)
        updateBlock(id, { settings: newSettings })
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        saveSettings({ ...localSettings, [key]: value })
    }, [localSettings, saveSettings])

    const handleFeatureChange = useCallback((index: number, updates: Partial<Feature>) => {
        const features = [...(localSettings.features || [])]
        features[index] = { ...features[index], ...updates }
        saveSettings({ ...localSettings, features })
    }, [localSettings, saveSettings])

    const handleAddFeature = () => {
        const features = [...(localSettings.features || []), { title: 'New Feature', description: 'Feature description', icon: 'CheckCircle' }]
        saveSettings({ ...localSettings, features })
    }

    const handleRemoveFeature = (index: number) => {
        const features = [...(localSettings.features || [])]
        features.splice(index, 1)
        saveSettings({ ...localSettings, features })
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
                    localSettings.align === 'left' ? "text-left items-start" :
                        localSettings.align === 'right' ? "text-right items-end" :
                            "text-center md:text-left items-center md:items-start"
                )}>
                    <EditableText
                        tagName={localSettings.level || 'h2'}
                        value={localSettings.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-4xl md:text-5xl font-bold font-heading"
                        style={{
                            fontFamily: localSettings.fontFamily,
                            fontSize: localSettings.fontSize,
                            color: localSettings.color
                        }}
                    />

                    <div className={cn(
                        "space-y-6 text-lg text-muted-foreground leading-relaxed",
                        localSettings.align === 'center' ? "mx-auto" : ""
                    )}>
                        <EditableText
                            tagName="p"
                            value={localSettings.description}
                            onChange={(v) => handleTextChange('description', v)}
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localSettings.fontFamily,
                                fontSize: localSettings.fontSize,
                                color: localSettings.color
                            }}
                        />

                        <div className="grid gap-4 pt-4">
                            {localSettings.features?.map((feature: Feature, i: number) => (
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
                                                fontFamily: localSettings.fontFamily,
                                                fontSize: localSettings.fontSize,
                                                color: localSettings.color
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
                                                fontFamily: localSettings.fontFamily,
                                                fontSize: localSettings.fontSize,
                                                color: localSettings.color
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
