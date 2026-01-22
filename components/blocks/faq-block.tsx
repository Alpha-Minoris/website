'use client'

import { BlockProps } from './types'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useEditorStore } from '@/lib/stores/editor-store'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function FAQBlock(block: BlockProps) {
    const { id, slug } = block
    const folder = slug
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

    // Local state - entire block
    const [localBlock, setLocalBlock] = useState<any>({ ...defaultData, ...block })

    // Use ref to always get latest state (fixes stale closure in saveBlock)
    const localBlockRef = useRef(localBlock)
    useEffect(() => {
        localBlockRef.current = localBlock
    }, [localBlock])

    const saveBlock = useCallback((updates: any) => {
        const currentBlock = localBlockRef.current
        const updatedBlock = { ...currentBlock, ...updates }
        setLocalBlock(updatedBlock)
        localBlockRef.current = updatedBlock
        updateBlock(id, updatedBlock)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        saveBlock({ [key]: value })
    }, [saveBlock])

    const handleItemChange = useCallback((index: number, updates: any) => {
        const currentBlock = localBlockRef.current
        const items = [...(currentBlock.items || [])]
        items[index] = { ...items[index], ...updates }
        saveBlock({ items })
    }, [saveBlock])

    const handleAddItem = () => {
        const currentBlock = localBlockRef.current
        const items = [...(currentBlock.items || []), { q: 'New Question', a: 'New Answer', asset: { type: 'icon', value: 'HelpCircle' } }]
        saveBlock({ items })
    }

    const handleRemoveItem = (index: number) => {
        const currentBlock = localBlockRef.current
        const items = [...(currentBlock.items || [])]
        items.splice(index, 1)
        saveBlock({ items })
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

    const handleFAQClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            if (e.target === e.currentTarget) {
                setActiveToolbarPos(null)
            }
        }
    }, [isEditMode])

    return (
        <section id={id} ref={sectionRef} onClickCapture={handleFAQClick} className="py-24 bg-transparent relative">
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
                <div className={cn(
                    "mb-12 relative",
                    (localBlock as any).align === 'left' ? "text-left" :
                        (localBlock as any).align === 'right' ? "text-right" :
                            "text-center"
                )}>
                    <EditableText
                        tagName={localBlock.level || 'h2'}
                        value={localBlock.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4"
                        style={{
                            fontFamily: localBlock.fontFamily,
                            fontSize: localBlock.fontSize,
                            color: localBlock.color
                        }}
                    />
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {localBlock.items?.map((item: any, i: number) => (
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
                                        size={item.asset?.size}
                                        maskSettings={item.asset?.maskSettings}
                                        folder={folder}
                                        className="w-6 h-6 rounded-lg bg-accent/5 border-none shrink-0"
                                        iconClassName="w-full h-full text-accent/60 group-data-[state=open]:text-accent"
                                    />
                                    <EditableText
                                        value={item.q}
                                        onChange={(v) => handleItemChange(i, { q: v })}
                                        isEditMode={isEditMode}
                                        onFocus={onTextFocus}
                                        onBlur={onTextBlur}
                                        className="w-full"
                                        style={{
                                            fontFamily: localBlock.fontFamily,
                                            fontSize: localBlock.fontSize,
                                            color: localBlock.color
                                        }}
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
                                    style={{
                                        fontFamily: localBlock.fontFamily,
                                        fontSize: localBlock.fontSize,
                                        color: localBlock.color
                                    }}
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


