'use client'

import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock as updateBlockAction } from '@/actions/block-actions'
import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function MissionBlock({ id, settings, sectionSlug, slug }: BlockProps) {
    const folder = sectionSlug || slug
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Default Data
    const defaultData = {
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
    const [localSettings, setLocalSettings] = useState<any>({ ...defaultData, ...settings })
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Sync from props
    useEffect(() => {
        if (settings) {
            setLocalSettings((prev: any) => ({ ...prev, ...settings }))
        }
    }, [settings])

    const saveSettings = useCallback((newSettings: any) => {
        setLocalSettings(newSettings)
        updateBlock(id, { settings: newSettings })

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await updateBlockAction(id, newSettings)
            } catch (err) {
                console.error("Failed to save mission:", err)
            }
        }, 800)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        saveSettings({ ...localSettings, [key]: value })
    }, [localSettings, saveSettings])

    const handleFeatureChange = useCallback((index: number, updates: any) => {
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
            const relativeTop = rect.bottom - sectionRect.top
            setActiveToolbarPos({ top: relativeTop, left: relativeLeft })
        }
    }, [])

    const onTextBlur = useCallback(() => {
        setTimeout(() => {
            const activeEl = document.activeElement
            if (!sectionRef.current?.contains(activeEl) && !activeEl?.closest('[data-radix-portal]')) {
                setActiveToolbarPos(null)
            }
        }, 150)
    }, [])

    return (
        <section
            id={id}
            ref={sectionRef}
            className="py-24 bg-black relative overflow-hidden"
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
                <div className="space-y-8">
                    <EditableText
                        tagName="h2"
                        value={localSettings.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-4xl md:text-5xl font-bold font-heading"
                    />

                    <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                        <EditableText
                            tagName="p"
                            value={localSettings.description}
                            onChange={(v) => handleTextChange('description', v)}
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                        />

                        <div className="grid gap-4 pt-4">
                            {localSettings.features?.map((feature: any, i: number) => (
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
                                        />
                                        <EditableText
                                            tagName="p"
                                            value={feature.description}
                                            onChange={(v) => handleFeatureChange(i, { description: v })}
                                            isEditMode={isEditMode}
                                            onFocus={onTextFocus}
                                            onBlur={onTextBlur}
                                            className="text-sm"
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
                    <div className="relative h-[500px] w-full bg-white/5 border border-white/10 backdrop-blur-3xl rounded-3xl flex items-center justify-center p-8">
                        {/* Abstract Graphic */}
                        <div className="relative w-full h-full border border-white/5 rounded-2xl overflow-hidden group">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.05))]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/30 rounded-full blur-3xl group-hover:bg-accent/40 transition-colors duration-700"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <EditableText
                                    value={localSettings.visualText}
                                    onChange={(v) => handleTextChange('visualText', v)}
                                    isEditMode={isEditMode}
                                    onFocus={onTextFocus}
                                    onBlur={onTextBlur}
                                    className="text-6xl font-bold text-white/5 font-heading text-center"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
