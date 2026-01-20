import { BlockProps } from './types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock as updateBlockAction } from '@/actions/block-actions'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'
import { LogoRibbon } from './hero/logo-ribbon'

export function HeroBlock({ id, settings, sectionSlug, slug }: BlockProps) {
    const folder = sectionSlug || slug
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Default Data
    const defaultData = {
        eyebrow: "AI Automation Agency",
        title: "Automate Your <br /> Future Today.",
        tagline: "We build custom AI agents and automation workflows that scale your business. Stop trading time for money.",
        primaryButton: { text: "Start Building", url: "#contact" },
        secondaryButton: { text: "View Case Studies", url: "#case-studies" },
        labels: [
            { text: 'Proven Frameworks', asset: { type: 'icon', value: 'CheckCircle' } },
            { text: 'Scalable Architecture', asset: { type: 'icon', value: 'CheckCircle' } },
            { text: 'Fast Delivery', asset: { type: 'icon', value: 'CheckCircle' } }
        ],
        logos: [
            { name: 'OpenAI', asset: { type: 'icon', value: 'Brain' } },
            { name: 'Anthropic', asset: { type: 'icon', value: 'Sparkles' } },
            { name: 'Zapier', asset: { type: 'icon', value: 'Zap' } },
            { name: 'N8n', asset: { type: 'icon', value: 'Terminal' } },
            { name: 'Midjourney', asset: { type: 'icon', value: 'Bot' } },
            { name: 'Gemini', asset: { type: 'icon', value: 'Code' } },
            { name: 'HuggingFace', asset: { type: 'icon', value: 'Cpu' } },
            { name: 'Vercel', asset: { type: 'icon', value: 'Globe' } },
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
                console.error("Failed to save hero:", err)
            }
        }, 800)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        const newSettings = { ...localSettings, [key]: value }
        saveSettings(newSettings)
    }, [localSettings, saveSettings])

    const handleLabelChange = useCallback((index: number, updates: any) => {
        const labels = [...(localSettings.labels || [])]
        labels[index] = { ...labels[index], ...updates }
        saveSettings({ ...localSettings, labels })
    }, [localSettings, saveSettings])

    const handleAddLabel = () => {
        const labels = [...(localSettings.labels || []), { text: "New Feature", asset: { type: 'icon', value: 'CheckCircle' } }]
        saveSettings({ ...localSettings, labels })
    }

    const handleRemoveLabel = (index: number) => {
        const labels = [...(localSettings.labels || [])]
        labels.splice(index, 1)
        saveSettings({ ...localSettings, labels })
    }

    const handleAddLogo = () => {
        const logos = [...(localSettings.logos || []), { name: "New Partner", asset: { type: 'icon', value: 'Globe' } }]
        saveSettings({ ...localSettings, logos })
    }

    const handleRemoveLogo = (index: number) => {
        const logos = [...(localSettings.logos || [])]
        logos.splice(index, 1)
        saveSettings({ ...localSettings, logos })
    }

    const handleLogoUpdate = (index: number, updates: any) => {
        const logos = [...(localSettings.logos || [])]
        logos[index] = { ...logos[index], ...updates }
        saveSettings({ ...localSettings, logos })
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
            if (!sectionRef.current?.contains(activeEl) && !inPortal) setActiveToolbarPos(null)
        }, 200)
    }, [])

    const handleHeroClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'hero-content-container') {
                setActiveToolbarPos(null)
            }
        }
    }, [isEditMode])

    return (
        <section
            ref={sectionRef}
            onClickCapture={handleHeroClick}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent pt-20 pb-32"
        >
            {/* Background Gradient (Noise handled by DynamicBackground) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent pointer-events-none"></div>

            {/* Flying Icons (Background) */}
            <LogoRibbon logos={localSettings.logos} />

            {/* Logo Admin Overlay */}
            {isEditMode && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 bg-black/80 p-4 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl scale-90 lg:scale-100 min-w-[320px]">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Manage Partners & Tools</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {localSettings.logos?.map((logo: any, idx: number) => (
                            <div key={idx} className="relative group/logo flex flex-col items-center gap-1">
                                <EditableAsset
                                    type={logo.asset.type}
                                    value={logo.asset.value}
                                    onChange={(type, value) => handleLogoUpdate(idx, { asset: { ...logo.asset, type, value } })}
                                    onUpdate={(updates) => handleLogoUpdate(idx, { asset: { ...logo.asset, ...updates } })}
                                    isEditMode={isEditMode}
                                    linkUrl={logo.asset.linkUrl}
                                    isHidden={logo.asset.isHidden}
                                    color={logo.asset.color}
                                    size={logo.asset.size}
                                    maskSettings={logo.asset.maskSettings}
                                    folder={folder}
                                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2"
                                />
                                <input
                                    type="text"
                                    value={logo.name}
                                    onChange={(e) => handleLogoUpdate(idx, { name: e.target.value })}
                                    className="w-16 bg-transparent border-none text-[10px] text-center text-zinc-400 focus:text-white focus:outline-none"
                                />
                                <div className="absolute -top-2 -right-2 opacity-0 group-hover/logo:opacity-100 transition-opacity z-10">
                                    <DeleteButton onClick={() => handleRemoveLogo(idx)} isEditMode={isEditMode} className="scale-75" />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleAddLogo}
                            className="w-12 h-12 flex flex-col items-center justify-center rounded-xl bg-white/5 border border-white/10 text-accent hover:bg-zinc-800 transition-all group/add"
                        >
                            <Plus size={20} className="group-hover/add:scale-110 transition-transform" />
                            <span className="text-[8px] mt-1 opacity-0 group-hover/add:opacity-100">Add</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Local Toolbar */}
            {isEditMode && activeToolbarPos && (
                <div
                    className="absolute z-50 transition-all duration-100"
                    style={{ top: activeToolbarPos.top, left: activeToolbarPos.left, transform: 'translateX(-50%)' }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <TextToolbar blockId={id} />
                </div>
            )}

            <div
                id="hero-content-container"
                className={cn(
                    "container mx-auto px-4 z-10 flex flex-col justify-center",
                    localSettings.align === 'left' ? "items-start text-left" :
                        localSettings.align === 'right' ? "items-end text-right" :
                            "items-center text-center"
                )}
            >
                <div className={cn(
                    "space-y-8 max-w-4xl",
                    localSettings.align === 'left' ? "mx-0" :
                        localSettings.align === 'right' ? "mx-0 ml-auto" :
                            "mx-auto"
                )}>
                    {/* Eyebrow */}
                    <span className={cn(
                        "inline-flex items-center gap-2 h-7 px-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm",
                        localSettings.align === 'left' ? "mr-auto" :
                            localSettings.align === 'right' ? "ml-auto" :
                                "mx-auto"
                    )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0"></span>
                        <EditableText
                            value={typeof localSettings.eyebrow === 'string'
                                ? localSettings.eyebrow.replace(/<[^>]*>/g, '')
                                : 'AI Automation Agency'}
                            onChange={(v) => handleTextChange('eyebrow', v)}
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            className="bg-transparent text-[11px] text-accent uppercase tracking-wider font-medium"
                        />
                    </span>

                    {/* Title */}
                    <EditableText
                        tagName={localSettings.level || 'h1'}
                        value={localSettings.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-5xl lg:text-8xl font-bold font-heading leading-[1.05] text-white tracking-tight"
                        style={{
                            fontFamily: localSettings.fontFamily,
                            fontSize: localSettings.fontSize,
                            color: localSettings.color
                        }}
                    />

                    {/* Tagline */}
                    <EditableText
                        tagName="p"
                        value={localSettings.tagline}
                        onChange={(v) => handleTextChange('tagline', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
                        style={{
                            fontFamily: localSettings.fontFamily,
                            fontSize: localSettings.fontSize,
                            color: localSettings.color
                        }}
                    />

                    {/* Buttons */}
                    <div className={cn(
                        "flex flex-col sm:flex-row gap-4 items-center",
                        localSettings.align === 'left' ? "justify-start" :
                            localSettings.align === 'right' ? "justify-end" :
                                "justify-center"
                    )}>
                        <div className="relative group">
                            <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.1)] rounded-2xl">
                                <EditableText
                                    value={localSettings.primaryButton?.text || "Button"}
                                    onChange={(v) => handleTextChange('primaryButton', { ...localSettings.primaryButton, text: v })}
                                    isEditMode={isEditMode}
                                    onFocus={onTextFocus}
                                    onBlur={onTextBlur}
                                />
                            </Button>
                        </div>
                        <div className="relative group">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/10 rounded-2xl backdrop-blur-sm">
                                <EditableText
                                    value={localSettings.secondaryButton?.text || "Button"}
                                    onChange={(v) => handleTextChange('secondaryButton', { ...localSettings.secondaryButton, text: v })}
                                    isEditMode={isEditMode}
                                    onFocus={onTextFocus}
                                    onBlur={onTextBlur}
                                />
                            </Button>
                        </div>
                    </div>

                    {/* Features/Labels */}
                    <div className={cn(
                        "flex flex-wrap gap-8 text-sm text-muted-foreground pt-8 items-center",
                        localSettings.align === 'left' ? "justify-start" :
                            localSettings.align === 'right' ? "justify-end" :
                                "justify-center"
                    )}>
                        {localSettings.labels?.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 group relative">
                                <EditableAsset
                                    type={item.asset?.type || 'icon'}
                                    value={item.asset?.value || 'CheckCircle'}
                                    onChange={(type, value) => handleLabelChange(i, { asset: { ...item.asset, type, value } })}
                                    onUpdate={(updates) => handleLabelChange(i, { asset: { ...item.asset, ...updates } })}
                                    isEditMode={isEditMode}
                                    linkUrl={item.asset?.linkUrl}
                                    isHidden={item.asset?.isHidden}
                                    color={item.asset?.color}
                                    size={item.asset?.size}
                                    maskSettings={item.asset?.maskSettings}
                                    folder={folder}
                                    className="w-7 h-7 opacity-60 group-hover:opacity-100"
                                    iconClassName="w-full h-full"
                                />
                                <EditableText
                                    value={typeof item === 'string' ? item : item.text}
                                    onChange={(v) => handleLabelChange(i, { text: v })}
                                    isEditMode={isEditMode}
                                    onFocus={onTextFocus}
                                    onBlur={onTextBlur}
                                    className="font-medium tracking-wide"
                                />
                                <DeleteButton
                                    onClick={() => handleRemoveLabel(i)}
                                    isEditMode={isEditMode}
                                    className="absolute -top-10 left-1/2 -translate-x-1/2"
                                />
                            </div>
                        ))}
                        <AddButton onClick={handleAddLabel} isEditMode={isEditMode} className="w-8 h-8" />
                    </div>
                </div>
            </div>
        </section>
    )
}
