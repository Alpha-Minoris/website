'use client'

import { BlockProps } from './types'
import { Check, Star, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TiltCard } from '@/components/ui/tilt-card'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock as updateBlockAction } from '@/actions/block-actions'
import { useState, useEffect, useRef, useCallback } from 'react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function PackagesBlock({ id, settings, sectionSlug, slug }: BlockProps) {
    const folder = sectionSlug || slug
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
                console.error("Failed to save packages:", err)
            }
        }, 800)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        saveSettings({ ...localSettings, [key]: value })
    }, [localSettings, saveSettings])

    const handlePackageUpdate = useCallback((index: number, updates: any) => {
        const packages = [...(localSettings.packages || [])]
        packages[index] = { ...packages[index], ...updates }
        saveSettings({ ...localSettings, packages })
    }, [localSettings, saveSettings])

    const handleAddPackage = () => {
        const packages = [...(localSettings.packages || []), {
            id: Math.random().toString(36).substr(2, 9),
            name: 'New Package',
            desc: 'Package description.',
            features: [{ text: 'New Feature', asset: { type: 'icon', value: 'Check' } }]
        }]
        saveSettings({ ...localSettings, packages })
    }

    const handleRemovePackage = (index: number) => {
        const packages = (localSettings.packages || []).filter((_: any, i: number) => i !== index)
        saveSettings({ ...localSettings, packages })
    }

    const handleAddFeature = (pkgIndex: number) => {
        const packages = [...(localSettings.packages || [])]
        const currentFeatures = Array.isArray(packages[pkgIndex].features) ? packages[pkgIndex].features : []
        packages[pkgIndex].features = [...currentFeatures, { text: "New Feature", asset: { type: 'icon', value: 'Check' } }]
        saveSettings({ ...localSettings, packages })
    }

    const handleRemoveFeature = (pkgIndex: number, featIndex: number) => {
        const packages = [...(localSettings.packages || [])]
        packages[pkgIndex].features = packages[pkgIndex].features.filter((_: any, i: number) => i !== featIndex)
        saveSettings({ ...localSettings, packages })
    }

    const handleFeatureChange = (pkgIndex: number, featIndex: number, updates: any) => {
        const packages = [...(localSettings.packages || [])]
        const currentFeat = typeof packages[pkgIndex].features[featIndex] === 'string'
            ? { text: packages[pkgIndex].features[featIndex], asset: { type: 'icon', value: 'Check' } }
            : packages[pkgIndex].features[featIndex]

        packages[pkgIndex].features[featIndex] = { ...currentFeat, ...updates }
        saveSettings({ ...localSettings, packages })
    }

    const toggleHighlight = (index: number) => {
        const packages = (localSettings.packages || []).map((pkg: any, i: number) => ({
            ...pkg,
            highlight: i === index ? !pkg.highlight : false
        }))
        saveSettings({ ...localSettings, packages })
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
                    localSettings.align === 'left' ? "text-left items-start" :
                        localSettings.align === 'right' ? "text-right items-end" :
                            "text-center items-center"
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

                <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto items-stretch">
                    {localSettings.packages?.map((pkg: any, idx: number) => (
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
                                                fontFamily: localSettings.fontFamily,
                                                fontSize: localSettings.fontSize,
                                                color: localSettings.color
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
                                                fontFamily: localSettings.fontFamily,
                                                fontSize: localSettings.fontSize,
                                                color: localSettings.color
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
                                                            fontFamily: localSettings.fontFamily,
                                                            fontSize: localSettings.fontSize,
                                                            color: localSettings.color
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
