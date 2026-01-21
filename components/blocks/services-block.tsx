'use client'

import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ServiceFlipCard } from './service-flip-card'
import { Eye, EyeOff } from 'lucide-react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'

export function ServicesBlock({ id, settings, sectionSlug, slug }: BlockProps) {
    const folder = sectionSlug || slug
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Default Data
    const defaultData = {
        title: 'Our Services',
        tagline: 'Comprehensive AI solutions tailored for modern enterprises.',
        services: [
            { id: '1', title: 'AI Automation Agents', asset: { type: 'icon', value: 'Bot' }, desc: 'Autonomous agents that handle customer support, outreach, and scheduling 24/7.', details: ['Multi-channel support', 'Natural Language Processing', 'Human-in-the-loop'], isHidden: false },
            { id: '2', title: 'Workflow Optimization', asset: { type: 'icon', value: 'Workflow' }, desc: 'Streamline operations by connecting your existing tools.', details: ['Zapier/Make Integration', 'Custom API Connectors', 'Real-time Event Triggers'], isHidden: false },
            { id: '3', title: 'Data Analytics', asset: { type: 'icon', value: 'BarChart' }, desc: 'Turn raw data into actionable insights with predictive AI models.', details: ['Predictive Forecasting', 'Sentiment Analysis', 'Automated Dashboards'], isHidden: false },
            { id: '4', title: 'Knowledge Bases', asset: { type: 'icon', value: 'Database' }, desc: 'Centralize your intelligence into a queryable AI brain.', details: ['RAG Implementation', 'Vector Database Setup', 'Slack/Discord Bots'], isHidden: false },
        ]
    }

    // Local state
    const [localSettings, setLocalSettings] = useState<any>({ ...defaultData, ...settings })

    // Sync from props
    useEffect(() => {
        if (settings) {
            setLocalSettings((prev: any) => ({ ...prev, ...settings }))
        }
    }, [settings])

    const saveSettings = useCallback((newSettings: any) => {
        setLocalSettings(newSettings)
        updateBlock(id, { settings: newSettings })
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        saveSettings({ ...localSettings, [key]: value })
    }, [localSettings, saveSettings])

    const handleServiceUpdate = useCallback((index: number, data: any) => {
        const services = [...(localSettings.services || [])]
        services[index] = { ...services[index], ...data }
        saveSettings({ ...localSettings, services })
    }, [localSettings, saveSettings])

    const handleAddService = () => {
        const services = [...(localSettings.services || []), {
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Service',
            asset: { type: 'icon', value: 'Zap' },
            desc: 'New service description.',
            details: ['Feature 1', 'Feature 2'],
            isHidden: false
        }]
        saveSettings({ ...localSettings, services })
    }

    const handleRemoveService = (index: number) => {
        const services = [...(localSettings.services || [])]
        services.splice(index, 1)
        saveSettings({ ...localSettings, services })
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

    const handleServicesClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            if (e.target === e.currentTarget) {
                setActiveToolbarPos(null)
            }
        }
    }, [isEditMode])

    return (
        <section id={id} ref={sectionRef} onClickCapture={handleServicesClick} className="py-24 bg-transparent relative">
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
                    "max-w-3xl mx-auto mb-16 space-y-4",
                    localSettings.align === 'left' ? "text-left ml-0 mr-auto" :
                        localSettings.align === 'right' ? "text-right mr-0 ml-auto" :
                            "text-center mx-auto"
                )}>
                    <EditableText
                        tagName={localSettings.level || 'h2'}
                        value={localSettings.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-3xl md:text-5xl font-bold font-heading"
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
                        className="text-muted-foreground text-lg"
                        style={{
                            fontFamily: localSettings.fontFamily,
                            fontSize: localSettings.fontSize,
                            color: localSettings.color
                        }}
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {localSettings.services?.map((service: any, i: number) => {
                        if (service.isHidden && !isEditMode) return null

                        return (
                            <div
                                key={service.id}
                                className={cn(
                                    "w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[280px] max-w-[340px] relative",
                                    service.isHidden && "opacity-50 grayscale"
                                )}
                            >
                                {/* Admin Controls */}
                                {isEditMode && (
                                    <div className="absolute -top-4 right-2 z-20 flex gap-2">
                                        <button
                                            onClick={() => handleServiceUpdate(i, { isHidden: !service.isHidden })}
                                            className="p-1.5 rounded-md bg-black/80 border border-white/10 text-white/50 hover:text-white transition-colors shadow-2xl"
                                            title={service.isHidden ? 'Show service' : 'Hide service'}
                                        >
                                            {service.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <DeleteButton onClick={() => handleRemoveService(i)} isEditMode={isEditMode} />
                                    </div>
                                )}
                                <ServiceFlipCard
                                    title={service.title}
                                    desc={service.desc}
                                    details={service.details}
                                    asset={service.asset}
                                    isEditMode={isEditMode}
                                    onUpdate={(data) => handleServiceUpdate(i, data)}
                                    onTextFocus={onTextFocus}
                                    onTextBlur={onTextBlur}
                                    folder={folder}
                                />
                            </div>
                        )
                    })}

                    {isEditMode && (
                        <div className="w-full flex justify-center mt-8">
                            <AddButton onClick={handleAddService} isEditMode={isEditMode} title="Add Service" className="w-12 h-12" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
