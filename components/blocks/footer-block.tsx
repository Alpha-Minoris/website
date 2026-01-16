'use client'

import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock as updateBlockAction } from '@/actions/block-actions'
import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { TextToolbar } from '@/components/editor/text-toolbar'

// Safe EditableText using ref-based updating to completely avoid React re-render interference on cursor
const EditableText = memo(({
    value,
    onChange,
    className,
    tagName = 'div',
    isEditMode,
    onFocus,
    onBlur
}: {
    value: string,
    onChange: (val: string) => void,
    className?: string,
    tagName?: 'div' | 'span' | 'p' | 'h3' | 'h4',
    isEditMode: boolean,
    onFocus?: (rect: DOMRect) => void,
    onBlur?: () => void
}) => {
    const Tag = tagName as any
    const ref = useRef<HTMLElement>(null)
    const isDirty = useRef(false)
    const lastContentHtml = useRef(value)

    // Initial Render / Remote Sync
    useEffect(() => {
        if (!isDirty.current && ref.current && ref.current.innerHTML !== value) {
            ref.current.innerHTML = value
            lastContentHtml.current = value
        }
    }, [value])

    // Use MutationObserver to detect changes from execCommand (Toolbar) which might not trigger standard React onInput
    useEffect(() => {
        if (!ref.current || !isEditMode) return

        const observer = new MutationObserver((mutations) => {
            const newHtml = ref.current?.innerHTML || ''
            if (newHtml !== lastContentHtml.current) {
                lastContentHtml.current = newHtml
                onChange(newHtml)
                isDirty.current = true
            }
        })

        observer.observe(ref.current, {
            characterData: true,
            childList: true,
            subtree: true,
            attributes: true // Catch link attribute changes
        })

        return () => observer.disconnect()
    }, [isEditMode, onChange])

    const handleInput = useCallback(() => {
        // Redundant safely with Observer but good for standard typing
        const newHtml = ref.current?.innerHTML || ''
        if (newHtml !== lastContentHtml.current) {
            lastContentHtml.current = newHtml
            onChange(newHtml)
            isDirty.current = true
        }
    }, [onChange])

    const handleFocus = useCallback((e: React.FocusEvent<HTMLElement>) => {
        if (onFocus) {
            const rect = e.currentTarget.getBoundingClientRect()
            onFocus(rect)
        }
    }, [onFocus])

    const handleBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
        const newHtml = e.currentTarget.innerHTML
        if (newHtml !== lastContentHtml.current) {
            lastContentHtml.current = newHtml
            onChange(newHtml)
            isDirty.current = false
        }
        if (onBlur) onBlur()
    }, [onChange, onBlur])

    // Only set dangerouslySetInnerHTML on initial mount (pseudo-key trick or just rely on ref)
    // Actually, simply relying on the Ref effect for updates is safest for ContentEditable,
    // but we need initial HTML.
    // We pass `defaultValue` via strictly initial render if possible, 
    // but React needs `dangerouslySetInnerHTML` to render server content.
    // To stop React from updating it, we can use `suppressHydrationWarning`.

    return (
        <Tag
            ref={ref}
            contentEditable={isEditMode}
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
                "outline-none transition-all duration-200 empty:before:content-['...'] empty:before:text-gray-500",
                isEditMode ? "hover:bg-white/10 p-1 -m-1 rounded cursor-text border border-dashed border-transparent hover:border-white/20 min-w-[20px]" : "",
                className
            )}
            // We pass value ONLY if we are fairly sure we aren't dirty.
            // But memo prevents parent re-renders from forcing this recalculation often.
            dangerouslySetInnerHTML={{ __html: value }}
        />
    )
}, (prev, next) => {
    // Custom comparison for memo
    // Only re-render if:
    // 1. isEditMode changes
    // 2. className changes
    // 3. value changes AND we are NOT dirty? 
    //    Actually, we want to allow value updates from parent if they are genuine (remote).
    //    But if parent just re-rendered due to toolbar, value is same.
    return (
        prev.isEditMode === next.isEditMode &&
        prev.className === next.className &&
        prev.value === next.value &&
        prev.tagName === next.tagName
        // Ignore onFocus/onBlur reference changes as they are typically stable or don't matter visually
    )
})

EditableText.displayName = 'EditableText'

const AddButton = ({ listKey, onAdd, isEditMode }: { listKey: string, onAdd: (key: string) => void, isEditMode: boolean }) => {
    if (!isEditMode) return null
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onAdd(listKey) }}
            className="ml-2 inline-flex items-center justify-center p-0.5 rounded-full hover:bg-white/20 text-white/50 hover:text-white transition-colors"
            title="Add new item"
        >
            <Plus size={14} />
        </button>
    )
}

const DeleteButton = ({ onClick, isEditMode }: { onClick: () => void, isEditMode: boolean }) => {
    if (!isEditMode) return null
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            contentEditable={false}
            className="ml-2 opacity-0 group-hover/item:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-colors"
            title="Remove item"
        >
            <Trash2 size={12} />
        </button>
    )
}

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

    // Initialize defaults
    useEffect(() => {
        const updates: any = {}
        if (!localSettings.legalLinks) updates.legalLinks = defaultLegal.map(t => `<a href="#">${t}</a>`)
        if (!localSettings.sitemapLinks) updates.sitemapLinks = defaultSitemap.map(t => `<a href="#">${t}</a>`)
        if (!localSettings.companyLines) updates.companyLines = defaultCompany
        if (!localSettings.socialLinks) updates.socialLinks = defaultSocial
        if (!localSettings.brandTitle) updates.brandTitle = "Alpha Minoris"

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
            const relativeTop = rect.bottom - footerRect.top
            setActiveToolbarPos({ top: relativeTop, left: relativeLeft })
        }
    }, [])

    const onTextBlur = useCallback(() => {
        setTimeout(() => {
            const activeEl = document.activeElement

            // Check if focus is still in footer
            const inFooter = footerRef.current?.contains(activeEl)

            // Check if focus is in a known portal/overlay (Radix UI, Select, Popover)
            // We check for common roles or data attributes used by Radix/Popper
            const inPortal = activeEl?.closest('[data-radix-portal]') ||
                activeEl?.closest('[role="dialog"]') ||
                activeEl?.closest('[role="listbox"]') ||
                activeEl?.closest('[role="menu"]')

            if (!inFooter && !inPortal) {
                setActiveToolbarPos(null)
            }
        }, 150)
    }, [])

    return (
        <footer
            id="footer-block-root"
            ref={footerRef}
            onClickCapture={handleFooterClick}
            className="bg-black border-t border-white/10 pt-16 pb-8 text-sm text-muted-foreground relative z-10 w-full"
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

            <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16">

                {/* Column 1: Brand & Tagline */}
                <div className="space-y-4">
                    <EditableText
                        tagName="h3"
                        value={localSettings.brandTitle || "Alpha Minoris"}
                        onChange={(v) => handleTextChange('brandTitle', v)}
                        className="text-xl font-bold text-white font-heading"
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                    />
                    <EditableText
                        value={localSettings.tagline || "Building the automated future, one agent at a time."}
                        onChange={(v) => handleTextChange('tagline', v)}
                        className="leading-relaxed focus:text-white block"
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                    />
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
                        />
                        <AddButton listKey="legalLinks" onAdd={handleAddItem} isEditMode={isEditMode} />
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
                        />
                        <AddButton listKey="companyLines" onAdd={handleAddItem} isEditMode={isEditMode} />
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
                            />
                            <DeleteButton onClick={() => handleRemoveItem('companyLines', i)} isEditMode={isEditMode} />
                        </div>
                    ))}
                </div>

                {/* Column 4: Sitemap / Links */}
                <div className="space-y-4 flex flex-col">
                    <div className="flex items-center">
                        <h4 className="font-bold text-white uppercase tracking-wider text-xs">Sitemap</h4>
                        <AddButton listKey="sitemapLinks" onAdd={handleAddItem} isEditMode={isEditMode} />
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
                            />
                            <DeleteButton onClick={() => handleRemoveItem('socialLinks', i)} isEditMode={isEditMode} />
                        </div>
                    ))}
                    <AddButton listKey="socialLinks" onAdd={handleAddItem} isEditMode={isEditMode} />
                </div>
            </div>
        </footer>
    )
}
