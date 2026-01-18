'use client'

import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock as updateBlockAction } from '@/actions/block-actions'
import { useState, useEffect, useRef, useCallback } from 'react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function HowWeWorkBlock({ id, settings, sectionSlug, slug }: BlockProps) {
    const folder = sectionSlug || slug
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Default Data
    const defaultData = {
        title: 'How We Work',
        tagline: 'A transparent, four-step process to transform your business.',
        steps: [
            { num: '01', title: 'Discovery', desc: 'We deep dive into your current processes to identify high-impact automation opportunities.', asset: { type: 'icon', value: 'Search' } },
            { num: '02', title: 'Strategy', desc: 'We design a custom AI architecture tailored to your specific business goals and constraints.', asset: { type: 'icon', value: 'Lightbulb' } },
            { num: '03', title: 'Development', desc: 'Our engineers build, test, and refine your agents using state-of-the-art LLMs.', asset: { type: 'icon', value: 'Code2' } },
            { num: '04', title: 'Deployment', desc: 'Seamless integration into your existing stack with zero downtime.', asset: { type: 'icon', value: 'Rocket' } },
        ]
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
                console.error("Failed to save how-we-work:", err)
            }
        }, 800)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        saveSettings({ ...localSettings, [key]: value })
    }, [localSettings, saveSettings])

    const handleStepChange = useCallback((index: number, updates: any) => {
        const steps = [...(localSettings.steps || [])]
        steps[index] = { ...steps[index], ...updates }
        saveSettings({ ...localSettings, steps })
    }, [localSettings, saveSettings])

    const handleAddStep = () => {
        const nextNum = String((localSettings.steps?.length || 0) + 1).padStart(2, '0')
        const steps = [...(localSettings.steps || []), {
            num: nextNum,
            title: 'New Step',
            desc: 'Describe the new step here.',
            asset: { type: 'icon', value: 'Star' }
        }]
        saveSettings({ ...localSettings, steps })
    }

    const handleRemoveStep = (index: number) => {
        const steps = (localSettings.steps || []).filter((_: any, i: number) => i !== index)
        // Re-index numbers
        const reindexedSteps = steps.map((s: any, i: number) => ({ ...s, num: String(i + 1).padStart(2, '0') }))
        saveSettings({ ...localSettings, steps: reindexedSteps })
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

    const handleHowWeWorkClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            if (e.target === e.currentTarget) {
                setActiveToolbarPos(null)
            }
        }
    }, [isEditMode])

    return (
        <section id={id} ref={sectionRef} onClickCapture={handleHowWeWorkClick} className="py-24 bg-black relative">
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

            <div className="container mx-auto px-4">
                <div className={cn(
                    "mb-16",
                    localSettings.align === 'left' ? "text-left" :
                        localSettings.align === 'right' ? "text-right" :
                            "text-center"
                )}>
                    <EditableText
                        tagName={localSettings.level || 'h2'}
                        value={localSettings.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4"
                        style={{
                            fontFamily: localSettings.fontFamily,
                            fontSize: localSettings.fontSize,
                            color: localSettings.color
                        }}
                    />
                    <EditableText
                        tagName="p"
                        value={localSettings.tagline}
                        onChange={(v) => handleTextChange('tagline', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-muted-foreground text-lg max-w-xl"
                        style={{
                            fontFamily: localSettings.fontFamily,
                            fontSize: localSettings.fontSize,
                            color: localSettings.color
                        }}
                    />
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 opacity-30"></div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {localSettings.steps?.map((step: any, idx: number) => (
                            <div key={idx} className="relative pt-8 group h-full flex flex-col">
                                {/* Number Chip */}
                                <div className="absolute top-0 left-0 md:left-1/2 md:-translate-x-1/2 w-24 h-24 flex items-center justify-center pointer-events-none">
                                    <span className="text-6xl font-bold text-white/5 font-heading group-hover:text-accent/10 transition-colors duration-500">
                                        {step.num}
                                    </span>
                                </div>

                                <div className="relative bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:border-accent/30 transition-colors mt-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-4">
                                        <EditableAsset
                                            type={step.asset?.type || 'icon'}
                                            value={step.asset?.value || 'CheckCircle'}
                                            onChange={(type: 'icon' | 'image', value: string) => handleStepChange(idx, { asset: { ...step.asset, type, value } })}
                                            onUpdate={(updates) => handleStepChange(idx, { asset: { ...step.asset, ...updates } })}
                                            isEditMode={isEditMode}
                                            linkUrl={step.asset?.linkUrl}
                                            isHidden={step.asset?.isHidden}
                                            color={step.asset?.color}
                                            maskSettings={step.asset?.maskSettings}
                                            folder={folder}
                                            className="w-8 h-8 rounded-lg bg-accent/10 border-none shrink-0"
                                            iconClassName="w-full h-full text-accent"
                                        />
                                    </div>

                                    <EditableText
                                        tagName="h3"
                                        value={step.title}
                                        onChange={(v) => handleStepChange(idx, { title: v })}
                                        isEditMode={isEditMode}
                                        onFocus={onTextFocus}
                                        onBlur={onTextBlur}
                                        className="text-xl font-bold font-heading mb-3"
                                        style={{
                                            fontFamily: localSettings.fontFamily,
                                            fontSize: localSettings.fontSize,
                                            color: localSettings.color
                                        }}
                                    />
                                    <EditableText
                                        tagName="p"
                                        value={step.desc}
                                        onChange={(v) => handleStepChange(idx, { desc: v })}
                                        isEditMode={isEditMode}
                                        onFocus={onTextFocus}
                                        onBlur={onTextBlur}
                                        className="text-sm text-muted-foreground leading-relaxed flex-1"
                                        style={{
                                            fontFamily: localSettings.fontFamily,
                                            fontSize: localSettings.fontSize,
                                            color: localSettings.color
                                        }}
                                    />
                                    {isEditMode && (
                                        <div className="absolute -top-3 -right-3 z-20">
                                            <DeleteButton onClick={() => handleRemoveStep(idx)} isEditMode={isEditMode} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isEditMode && (
                            <div className="relative pt-8 flex items-center justify-center h-full min-h-[160px]">
                                <AddButton onClick={handleAddStep} isEditMode={isEditMode} title="Add Step" className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
