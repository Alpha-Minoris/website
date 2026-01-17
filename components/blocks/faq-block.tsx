'use client'

import { BlockProps } from './types'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock as updateBlockAction } from '@/actions/block-actions'
import { useState, useEffect, useRef, useCallback } from 'react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function FAQBlock({ id, settings, sectionSlug, slug }: BlockProps) {
    const folder = sectionSlug || slug
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Default Data
    const defaultData = {
        title: 'Frequently Asked Questions',
        items: [
            { q: 'How is this different from generic AI tools like ChatGPT?', a: 'ChatGPT is a tool. We build workflows. We integrate AI directly into your business logic, connecting it to your databases, CRMs, and APIs to perform complex actions autonomously.', asset: { type: 'icon', value: 'Brain' } },
            { q: 'Is my data secure?', a: 'Absolutely. We practice data minimalization and can deploy agents within your own VPC. We never train public models on your private data.', asset: { type: 'icon', value: 'ShieldCheck' } },
            { q: 'How long does implementation take?', a: 'A typical pilot takes 2-4 weeks. Enterprise-wide deployment depends on complexity but generally follows a 8-12 week timeline.', asset: { type: 'icon', value: 'Timer' } },
            { q: 'Do I need a technical team?', a: 'No. We handle the entire technical implementation. Your team just provides the business requirements and feedback.', asset: { type: 'icon', value: 'Users' } },
            { q: 'What is the pricing model?', a: 'We typically charge a setup fee + a monthly maintenance retainer. For high-volume processing, we utilize utility-based pricing.', asset: { type: 'icon', value: 'CreditCard' } }
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
                console.error("Failed to save FAQ:", err)
            }
        }, 800)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        saveSettings({ ...localSettings, [key]: value })
    }, [localSettings, saveSettings])

    const handleItemChange = useCallback((index: number, updates: any) => {
        const items = [...(localSettings.items || [])]
        items[index] = { ...items[index], ...updates }
        saveSettings({ ...localSettings, items })
    }, [localSettings, saveSettings])

    const handleAddItem = () => {
        const items = [...(localSettings.items || []), { q: 'New Question', a: 'New Answer', asset: { type: 'icon', value: 'HelpCircle' } }]
        saveSettings({ ...localSettings, items })
    }

    const handleRemoveItem = (index: number) => {
        const items = [...(localSettings.items || [])]
        items.splice(index, 1)
        saveSettings({ ...localSettings, items })
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
        <section id={id} ref={sectionRef} className="py-24 bg-black relative">
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

            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12 relative">
                    <EditableText
                        tagName="h2"
                        value={localSettings.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4"
                    />
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {localSettings.items?.map((item: any, i: number) => (
                        <AccordionItem key={i} value={`item-${i}`} className="group border border-white/10 bg-white/5 rounded-lg px-4 data-[state=open]:border-accent/40 data-[state=open]:bg-white/10 transition-all relative">
                            {isEditMode && (
                                <DeleteButton
                                    onClick={() => handleRemoveItem(i)}
                                    isEditMode={isEditMode}
                                    className="absolute -right-12 top-1/2 -translate-y-1/2"
                                />
                            )}
                            <AccordionTrigger className="text-lg font-heading hover:no-underline hover:text-accent text-left py-4">
                                <div className="flex items-center gap-4 w-full">
                                    <EditableAsset
                                        type={item.asset?.type || 'icon'}
                                        value={item.asset?.value || 'HelpCircle'}
                                        onChange={(type: 'icon' | 'image', value: string) => handleItemChange(i, { asset: { ...item.asset, type, value } })}
                                        onUpdate={(updates) => handleItemChange(i, { asset: { ...item.asset, ...updates } })}
                                        isEditMode={isEditMode}
                                        linkUrl={item.asset?.linkUrl}
                                        isHidden={item.asset?.isHidden}
                                        color={item.asset?.color}
                                        maskSettings={item.asset?.maskSettings}
                                        folder={folder}
                                        className="w-10 h-10 rounded-lg bg-accent/5 border-none shrink-0"
                                        iconClassName="w-full h-full text-accent/60 group-data-[state=open]:text-accent"
                                    />
                                    <EditableText
                                        value={item.q}
                                        onChange={(v) => handleItemChange(i, { q: v })}
                                        isEditMode={isEditMode}
                                        onFocus={onTextFocus}
                                        onBlur={onTextBlur}
                                        className="w-full"
                                    />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                                <EditableText
                                    tagName="p"
                                    value={item.a}
                                    onChange={(v) => handleItemChange(i, { a: v })}
                                    isEditMode={isEditMode}
                                    onFocus={onTextFocus}
                                    onBlur={onTextBlur}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}

                    {isEditMode && (
                        <div className="flex justify-center pt-4">
                            <AddButton onClick={handleAddItem} isEditMode={isEditMode} title="Add FAQ Item" className="w-10 h-10" />
                        </div>
                    )}
                </Accordion>
            </div>
        </section>
    )
}
