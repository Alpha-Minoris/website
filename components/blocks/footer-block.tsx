'use client'

import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock as updateBlockAction } from '@/actions/block-actions'
import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { TextToolbar } from '@/components/editor/text-toolbar'

import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function FooterBlock({ id, settings, sectionId }: BlockProps) {
    const { isEditMode, updateBlock } = useEditorStore()
    const year = new Date().getFullYear()

    // Default Data
    const defaultLegal = ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Impressum']
    const defaultSitemap = ['Home', 'Services', 'Packages', 'Case Studies', 'Contact']
    const defaultCompany = ['Alpha Minoris Agency', '123 Innovation Drive', 'Tech City, TC 90210']
    const defaultSocial = [
        '<a href="#">Twitter</a>',
        '<a href="#">LinkedIn</a>',
        '<a href="#">GitHub</a>'
    ]

    // Local state
    const [localSettings, setLocalSettings] = useState(settings || {})
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const footerRef = useRef<HTMLElement>(null)

    // Toolbar Positioning
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Sync from props
    useEffect(() => {
        setLocalSettings(settings || {})
    }, [settings])

    const saveSettings = useCallback((newSettings: any) => {
        // This function is now primarily for initial default setup or full object replacement.
        // Individual text/list changes use their own debounced save logic.
        setLocalSettings(newSettings)
        updateBlock(id, { settings: newSettings })

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await updateBlockAction(id, newSettings)
            } catch (err) {
                console.error("Failed to save footer:", err)
            }
        }, 800)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        // We use the current localSettings directly. 
        // Since EditableText only fires onBlur, this is not a high-freq update that needs functional set state for intermediate values.
        if (localSettings[key] === value) return

        const newSettings = { ...localSettings, [key]: value }
        setLocalSettings(newSettings)

        // Optimistic update
        updateBlock(id, { settings: newSettings })

        // Debounced Save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(async () => {
            await updateBlockAction(id, newSettings)
        }, 800)
    }, [id, localSettings, updateBlock])

    const handleListChange = useCallback((listKey: string, index: number, value: string) => {
        const list = [...(localSettings[listKey] || [])]
        if (list[index] === value) return

        list[index] = value
        const newSettings = { ...localSettings, [listKey]: list }

        setLocalSettings(newSettings)
        updateBlock(id, { settings: newSettings })

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(async () => {
            await updateBlockAction(id, newSettings)
        }, 800)
    }, [id, localSettings, updateBlock])

    const handleAddItem = (listKey: string) => {
        const defaultValue = "New Item"
        const list = [...(localSettings[listKey] || [])]
        const newItem = `<a href="#">${defaultValue}</a>`
        list.push(newItem)
        saveSettings({ ...localSettings, [listKey]: list })
    }

    const handleRemoveItem = (listKey: string, index: number) => {
        const list = [...(localSettings[listKey] || [])]
        list.splice(index, 1)
        saveSettings({ ...localSettings, [listKey]: list })
    }

    const handleLogoUpdate = (type: 'icon' | 'image', value: string) => {
        const newSettings = { ...localSettings, logoType: type, logoValue: value }
        setLocalSettings(newSettings)
        updateBlock(id, { settings: newSettings })

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(async () => {
            await updateBlockAction(id, newSettings)
        }, 800)
    }

    // Initialize defaults
    useEffect(() => {
        const updates: any = {}
        if (!localSettings.legalLinks) updates.legalLinks = defaultLegal.map(t => `<a href="#">${t}</a>`)
        if (!localSettings.sitemapLinks) updates.sitemapLinks = defaultSitemap.map(t => `<a href="#">${t}</a>`)
        if (!localSettings.companyLines) updates.companyLines = defaultCompany
        if (!localSettings.socialLinks) updates.socialLinks = defaultSocial
        if (!localSettings.brandTitle) updates.brandTitle = "Alpha Minoris"
        if (!localSettings.logoType) {
            updates.logoType = 'image'
            updates.logoValue = ''
        }

        if (Object.keys(updates).length > 0) {
            // Only apply if missing keys
            const merged = { ...localSettings, ...updates }
            // Check if actually different to avoid loop
            if (JSON.stringify(merged) !== JSON.stringify(localSettings)) {
                saveSettings(merged)
            }
        }
    }, [localSettings, defaultLegal, defaultSitemap, defaultCompany, defaultSocial, saveSettings])

    const handleFooterClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            const link = (e.target as HTMLElement).closest('a')
            if (link) e.preventDefault()

            if (e.target === e.currentTarget || e.target === footerRef.current) {
                setActiveToolbarPos(null)
            }
        }
    }, [isEditMode])

    const onTextFocus = useCallback((rect: DOMRect) => {
        if (footerRef.current) {
            const footerRect = footerRef.current.getBoundingClientRect()
            const relativeLeft = rect.left - footerRect.left + (rect.width / 2)
            const relativeTop = rect.top - footerRect.top
            setActiveToolbarPos({ top: relativeTop - 40, left: relativeLeft })
        }
    }, [])

    const onTextBlur = useCallback(() => {
        setTimeout(() => {
            const activeEl = document.activeElement

            // Check if focus is still in footer
            const inFooter = footerRef.current?.contains(activeEl)

            // Check if focus is in a known portal/overlay (Radix UI, Select, Popover)
            const inPortal = activeEl?.closest('[data-radix-portal]') ||
                activeEl?.closest('[role="dialog"]') ||
                activeEl?.closest('[role="listbox"]') ||
                activeEl?.closest('[role="menu"]') ||
                activeEl?.closest('[data-radix-popper-content-wrapper]')

            if (!inFooter && !inPortal) {
                setActiveToolbarPos(null)
            }
        }, 200)
    }, [])

    return (
        <footer
            id="footer-block-root"
            ref={footerRef}
            onClickCapture={handleFooterClick}
            className="bg-transparent border-t border-white/10 pt-16 pb-8 text-sm text-muted-foreground relative z-10 w-full"
        >
            {/* Dynamic Local Toolbar */}
            {isEditMode && activeToolbarPos && (
                <div
                    className="absolute z-50 transition-all duration-100 ease-out"
                    style={{
                        top: activeToolbarPos.top,
                        left: activeToolbarPos.left,
                        transform: 'translateY(-10px)'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <TextToolbar blockId={id} />
                </div>
            )}

            <div className={cn(
                "container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16",
                localSettings.align === 'left' ? "text-left" :
                    localSettings.align === 'right' ? "text-right" :
                        "text-center md:text-left" // Default footer behavior
            )}>

                {/* Column 1: Brand & Tagline */}
                <div className={cn(
                    "space-y-6",
                    localSettings.align === 'left' ? "flex flex-col items-start" :
                        localSettings.align === 'right' ? "flex flex-col items-end" :
                            "flex flex-col items-center md:items-start"
                )}>
                    <div className="w-32 h-32 relative">
                        <EditableAsset
                            type={localSettings.logoType || 'image'}
                            value={localSettings.logoValue || ''}
                            onChange={handleLogoUpdate}
                            isEditMode={isEditMode}
                            placeholderText="LOGO"
                            className="bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-4">
                        <EditableText
                            tagName={localSettings.level || 'h3'}
                            value={localSettings.brandTitle || "Alpha Minoris"}
                            onChange={(v) => handleTextChange('brandTitle', v)}
                            className="text-xl font-bold text-white font-heading"
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localSettings.fontFamily,
                                fontSize: localSettings.fontSize,
                                color: localSettings.color
                            }}
                        />
                        <EditableText
                            value={localSettings.tagline || "Building the automated future, one agent at a time."}
                            onChange={(v) => handleTextChange('tagline', v)}
                            className="leading-relaxed focus:text-white block"
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localSettings.fontFamily,
                                fontSize: localSettings.fontSize,
                                color: localSettings.color
                            }}
                        />
                    </div>
                </div>

                {/* Column 2: Legal */}
                <div className="space-y-4 flex flex-col">
                    <div className="flex items-center">
                        <EditableText
                            tagName="h4"
                            value={localSettings.legalTitle || "Legal"}
                            onChange={(v) => handleTextChange('legalTitle', v)}
                            className="font-bold text-white uppercase tracking-wider text-xs w-fit"
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localSettings.fontFamily,
                                fontSize: localSettings.fontSize,
                                color: localSettings.color
                            }}
                        />
                        <AddButton onClick={() => handleAddItem('legalLinks')} isEditMode={isEditMode} />
                    </div>
                    {Array.isArray(localSettings.legalLinks) && localSettings.legalLinks.map((html: string, i: number) => (
                        <div key={i} className="flex items-center group/item w-fit">
                            <EditableText
                                value={html}
                                onChange={(v) => handleListChange('legalLinks', i, v)}
                                className="inline-block hover:text-white transition-colors"
                                isEditMode={isEditMode}
                                onFocus={onTextFocus}
                                onBlur={onTextBlur}
                                style={{
                                    fontFamily: localSettings.fontFamily,
                                    fontSize: localSettings.fontSize,
                                    color: localSettings.color
                                }}
                            />
                            <DeleteButton onClick={() => handleRemoveItem('legalLinks', i)} isEditMode={isEditMode} />
                        </div>
                    ))}
                </div>

                {/* Column 3: Company */}
                <div className="space-y-4">
                    <div className="flex items-center">
                        <EditableText
                            tagName="h4"
                            value={localSettings.companyTitle || "Company"}
                            onChange={(v) => handleTextChange('companyTitle', v)}
                            className="font-bold text-white uppercase tracking-wider text-xs w-fit"
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localSettings.fontFamily,
                                fontSize: localSettings.fontSize,
                                color: localSettings.color
                            }}
                        />
                        <AddButton onClick={() => handleAddItem('companyLines')} isEditMode={isEditMode} />
                    </div>
                    {Array.isArray(localSettings.companyLines) && localSettings.companyLines.map((html: string, i: number) => (
                        <div key={i} className="flex items-center group/item w-fit">
                            <EditableText
                                value={html}
                                onChange={(v) => handleListChange('companyLines', i, v)}
                                className="block"
                                isEditMode={isEditMode}
                                onFocus={onTextFocus}
                                onBlur={onTextBlur}
                                style={{
                                    fontFamily: localSettings.fontFamily,
                                    fontSize: localSettings.fontSize,
                                    color: localSettings.color
                                }}
                            />
                            <DeleteButton onClick={() => handleRemoveItem('companyLines', i)} isEditMode={isEditMode} />
                        </div>
                    ))}
                </div>

                {/* Column 4: Sitemap / Links */}
                <div className="space-y-4 flex flex-col">
                    <div className="flex items-center">
                        <h4 className="font-bold text-white uppercase tracking-wider text-xs">Sitemap</h4>
                        <AddButton onClick={() => handleAddItem('sitemapLinks')} isEditMode={isEditMode} />
                    </div>
                    {Array.isArray(localSettings.sitemapLinks) && localSettings.sitemapLinks.map((html: string, i: number) => (
                        <div key={i} className="flex items-center group/item w-fit">
                            <EditableText
                                value={html}
                                onChange={(v) => handleListChange('sitemapLinks', i, v)}
                                className="inline-block hover:text-white transition-colors"
                                isEditMode={isEditMode}
                                onFocus={onTextFocus}
                                onBlur={onTextBlur}
                                style={{
                                    fontFamily: localSettings.fontFamily,
                                    fontSize: localSettings.fontSize,
                                    color: localSettings.color
                                }}
                            />
                            <DeleteButton onClick={() => handleRemoveItem('sitemapLinks', i)} isEditMode={isEditMode} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 pt-8 border-t border-white/5 text-xs text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; {year} Alpha Minoris. All rights reserved.</p>
                <div className="flex gap-4 items-center">
                    {Array.isArray(localSettings.socialLinks) && localSettings.socialLinks.map((html: string, i: number) => (
                        <div key={i} className="flex items-center group/item">
                            <EditableText
                                value={html}
                                onChange={(v) => handleListChange('socialLinks', i, v)}
                                className="hover:text-white transition-colors"
                                isEditMode={isEditMode}
                                onFocus={onTextFocus}
                                onBlur={onTextBlur}
                                style={{
                                    fontFamily: localSettings.fontFamily,
                                    fontSize: localSettings.fontSize,
                                    color: localSettings.color
                                }}
                            />
                            <DeleteButton onClick={() => handleRemoveItem('socialLinks', i)} isEditMode={isEditMode} />
                        </div>
                    ))}
                    <AddButton onClick={() => handleAddItem('socialLinks')} isEditMode={isEditMode} />
                </div>
            </div>
        </footer>
    )
}
