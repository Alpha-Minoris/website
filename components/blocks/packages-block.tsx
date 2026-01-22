'use client'

import { BlockProps } from './types'
import { Check, Star, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TiltCard } from '@/components/ui/tilt-card'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useState, useEffect, useRef, useCallback } from 'react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function PackagesBlock(block: BlockProps) {
    const { id, slug } = block
    const folder = slug
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Default Data
    const defaultData = {
        title: 'Simple Packages',
        tagline: 'Transparent engagement models. No hidden fees.',
        packages: [
            {
                id: 'starter',
                name: 'Starter',
                desc: 'For small teams exploring AI.',
                features: [
                    { text: '1 Custom AI Agent', asset: { type: 'icon', value: 'Check' } },
                    { text: 'Basic Workflow Automation', asset: { type: 'icon', value: 'Check' } },
                    { text: 'Email Support', asset: { type: 'icon', value: 'Check' } },
                    { text: 'Weekly Reports', asset: { type: 'icon', value: 'Check' } }
                ]
            },
            {
                id: 'growth',
                name: 'Growth',
                desc: 'For scaling businesses.',
                highlight: true,
                features: [
                    { text: '3 Custom AI Agents', asset: { type: 'icon', value: 'Check' } },
                    { text: 'Full CRM Integration', asset: { type: 'icon', value: 'Check' } },
                    { text: 'Priority Support', asset: { type: 'icon', value: 'Check' } },
                    { text: 'Daily Analytics', asset: { type: 'icon', value: 'Check' } },
                    { text: 'Strategy Consulting', asset: { type: 'icon', value: 'Check' } }
                ]
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                desc: 'For large organizations.',
                features: [
                    { text: 'Unlimited Agents', asset: { type: 'icon', value: 'Check' } },
                    { text: 'Custom LLM Fine-tuning', asset: { type: 'icon', value: 'Check' } },
                    { text: 'Dedicated Success Manager', asset: { type: 'icon', value: 'Check' } },
                    { text: 'SLA Guarantee', asset: { type: 'icon', value: 'Check' } },
                    { text: 'On-premise Deployment', asset: { type: 'icon', value: 'Check' } }
                ]
            }
        ]
    }


    // Local state - only initialized once from props, not continuously synced
    const [localBlock, setlocalBlock] = useState<any>({ ...defaultData, ...block })

    // Use ref to always get latest state (fixes stale closure in saveBlock)
    const localBlockRef = useRef(localBlock)
    useEffect(() => {
        localBlockRef.current = localBlock
    }, [localBlock])

    const saveBlock = useCallback((newblock: any) => {
        setlocalBlock(newblock)
        localBlockRef.current = newblock
        updateBlock(id, newblock)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        const currentBlock = localBlockRef.current
        saveBlock({ ...currentBlock, [key]: value })
    }, [saveBlock])

    const handlePackageUpdate = useCallback((index: number, updates: any) => {
        const currentBlock = localBlockRef.current
        const packages = [...(currentBlock.packages || [])]
        packages[index] = { ...packages[index], ...updates }
        saveBlock({ ...currentBlock, packages })
    }, [saveBlock])

    const handleAddPackage = () => {
        const currentBlock = localBlockRef.current
        const packages = [...(currentBlock.packages || []), {
            id: Math.random().toString(36).substr(2, 9),
            name: 'New Package',
            desc: 'Package description.',
            features: [{ text: 'New Feature', asset: { type: 'icon', value: 'Check' } }]
        }]
        saveBlock({ ...currentBlock, packages })
    }

    const handleRemovePackage = (index: number) => {
        const currentBlock = localBlockRef.current
        const packages = (currentBlock.packages || []).filter((_: any, i: number) => i !== index)
        saveBlock({ ...currentBlock, packages })
    }

    const handleAddFeature = (pkgIndex: number) => {
        const currentBlock = localBlockRef.current
        const packages = [...(currentBlock.packages || [])]
        const currentFeatures = Array.isArray(packages[pkgIndex].features) ? packages[pkgIndex].features : []
        packages[pkgIndex].features = [...currentFeatures, { text: "New Feature", asset: { type: 'icon', value: 'Check' } }]
        saveBlock({ ...currentBlock, packages })
    }

    const handleRemoveFeature = (pkgIndex: number, featIndex: number) => {
        const currentBlock = localBlockRef.current
        const packages = [...(currentBlock.packages || [])]
        packages[pkgIndex].features = packages[pkgIndex].features.filter((_: any, i: number) => i !== featIndex)
        saveBlock({ ...currentBlock, packages })
    }

    const handleFeatureChange = (pkgIndex: number, featIndex: number, updates: any) => {
        const currentBlock = localBlockRef.current
        const packages = [...(currentBlock.packages || [])]
        const currentFeat = typeof packages[pkgIndex].features[featIndex] === 'string'
            ? { text: packages[pkgIndex].features[featIndex], asset: { type: 'icon', value: 'Check' } }
            : packages[pkgIndex].features[featIndex]

        packages[pkgIndex].features[featIndex] = { ...currentFeat, ...updates }
        saveBlock({ ...currentBlock, packages })
    }

    const toggleHighlight = (index: number) => {
        const currentBlock = localBlockRef.current
        const packages = (currentBlock.packages || []).map((pkg: any, i: number) => ({
            ...pkg,
            highlight: i === index ? !pkg.highlight : false
        }))
        saveBlock({ ...currentBlock, packages })
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

    const handlePackagesClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            if (e.target === e.currentTarget) {
                setActiveToolbarPos(null)
            }
        }
    }, [isEditMode])

    return (
        <section id={id} ref={sectionRef} onClickCapture={handlePackagesClick} className="py-24 bg-transparent relative">
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
                    "mb-16 space-y-4",
                    localBlock.align === 'left' ? "text-left items-start" :
                        localBlock.align === 'right' ? "text-right items-end" :
                            "text-center items-center"
                )}>
                    <EditableText
                        tagName={localBlock.level || 'h2'}
                        value={localBlock.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-3xl md:text-5xl font-bold font-heading"
                        style={{
                            fontFamily: localBlock.fontFamily,
                            fontSize: localBlock.fontSize,
                            color: localBlock.color
                        }}
                    />
                    <EditableText
                        tagName="p"
                        value={localBlock.tagline}
                        onChange={(v) => handleTextChange('tagline', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-muted-foreground text-lg"
                        style={{
                            fontFamily: localBlock.fontFamily,
                            fontSize: localBlock.fontSize,
                            color: localBlock.color
                        }}
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto items-stretch">
                    {localBlock.packages?.map((pkg: any, idx: number) => (
                        <TiltCard key={idx} className={cn("w-full md:w-[calc(33.33%-22px)] min-w-[300px] relative group", pkg.highlight ? "z-10" : "")}>
                            {/* Admin Controls */}
                            {isEditMode && (
                                <div className="absolute -top-4 -right-4 z-30 flex gap-2">
                                    <button
                                        onClick={() => toggleHighlight(idx)}
                                        className={cn(
                                            "p-1.5 rounded-md border transition-all shadow-xl",
                                            pkg.highlight ? "bg-accent border-accent text-white" : "bg-black/50 border-white/10 text-white/50 hover:text-white"
                                        )}
                                        title="Set as Most Popular"
                                    >
                                        <Star size={14} fill={pkg.highlight ? "currentColor" : "none"} />
                                    </button>
                                    <DeleteButton onClick={() => handleRemovePackage(idx)} isEditMode={isEditMode} />
                                </div>
                            )}

                            <Card className={cn(
                                "relative flex flex-col border-white/10 backdrop-blur-sm transition-all duration-300 h-full",
                                pkg.highlight ? "bg-white/10 border-accent/50 shadow-2xl" : "bg-white/5 hover:bg-white/8"
                            )}>
                                {pkg.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold uppercase tracking-widest rounded-lg">
                                        Most Popular
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl font-heading">
                                        <EditableText
                                            value={pkg.name}
                                            onChange={(v) => handlePackageUpdate(idx, { name: v })}
                                            isEditMode={isEditMode}
                                            onFocus={onTextFocus}
                                            onBlur={onTextBlur}
                                            style={{
                                                fontFamily: localBlock.fontFamily,
                                                fontSize: localBlock.fontSize,
                                                color: localBlock.color
                                            }}
                                        />
                                    </CardTitle>
                                    <CardDescription className="text-white/60">
                                        <EditableText
                                            value={pkg.desc}
                                            onChange={(v) => handlePackageUpdate(idx, { desc: v })}
                                            isEditMode={isEditMode}
                                            onFocus={onTextFocus}
                                            onBlur={onTextBlur}
                                            style={{
                                                fontFamily: localBlock.fontFamily,
                                                fontSize: localBlock.fontSize,
                                                color: localBlock.color
                                            }}
                                        />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="space-y-4">
                                        {pkg.features?.map((feat: any, i: number) => {
                                            const featObj = typeof feat === 'string'
                                                ? { text: feat, asset: { type: 'icon', value: 'Check' } }
                                                : feat

                                            return (
                                                <li key={i} className="flex items-start gap-3 text-sm text-foreground/90 group/feat">
                                                    <EditableAsset
                                                        type={featObj.asset?.type || 'icon'}
                                                        value={featObj.asset?.value || 'Check'}
                                                        onChange={(type: 'icon' | 'image', value: string) => handleFeatureChange(idx, i, { asset: { ...featObj.asset, type, value } })}
                                                        onUpdate={(updates) => handleFeatureChange(idx, i, { asset: { ...featObj.asset, ...updates } })}
                                                        isEditMode={isEditMode}
                                                        linkUrl={featObj.asset?.linkUrl}
                                                        isHidden={featObj.asset?.isHidden}
                                                        color={featObj.asset?.color}
                                                        size={featObj.asset?.size}
                                                        maskSettings={featObj.asset?.maskSettings}
                                                        folder={folder}
                                                        className="w-5 h-5 shrink-0"
                                                        iconClassName="w-full h-full text-accent"
                                                    />
                                                    <EditableText
                                                        value={featObj.text}
                                                        onChange={(v: string) => handleFeatureChange(idx, i, { text: v })}
                                                        isEditMode={isEditMode}
                                                        onFocus={onTextFocus}
                                                        onBlur={onTextBlur}
                                                        className="flex-1"
                                                        style={{
                                                            fontFamily: localBlock.fontFamily,
                                                            fontSize: localBlock.fontSize,
                                                            color: localBlock.color
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleRemoveFeature(idx, i)}
                                                        className={cn(
                                                            "text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover/feat:opacity-100",
                                                            !isEditMode && "hidden"
                                                        )}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </li>
                                            )
                                        })}
                                        {isEditMode && (
                                            <button
                                                onClick={() => handleAddFeature(idx)}
                                                className="flex items-center gap-2 text-xs text-accent/50 hover:text-accent transition-colors pt-2"
                                            >
                                                <Plus size={12} /> Add Feature
                                            </button>
                                        )}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className={cn(
                                        "w-full h-12 text-base font-bold tracking-wide shadow-lg",
                                        pkg.highlight
                                            ? "bg-accent text-white hover:bg-accent/90 hover:shadow-accent/20"
                                            : "bg-white text-black hover:bg-white/90"
                                    )} asChild>
                                        <a href="#contact">Get Started</a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TiltCard>
                    ))}

                    {isEditMode && (
                        <div className="flex items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-3xl hover:border-accent/20 transition-colors bg-white/[0.02] h-full min-h-[400px]">
                            <AddButton onClick={handleAddPackage} isEditMode={isEditMode} title="Add Package" className="w-16 h-16" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}




