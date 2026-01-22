'use client'

import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { TextToolbar } from '@/components/editor/text-toolbar'

import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function FooterBlock(block: BlockProps) {
    const { id, slug } = block
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

    // Local state - entire block
    const [localBlock, setLocalBlock] = useState(block || {})
    const footerRef = useRef<HTMLElement>(null)

    // Toolbar Positioning
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Use ref to always get latest state (fixes stale closure in saveBlock)
    const localBlockRef = useRef(localBlock)
    useEffect(() => {
        localBlockRef.current = localBlock
    }, [localBlock])

    // Sync from props
    useEffect(() => {
        setLocalBlock(block || {})
    }, [block])

    const saveBlock = useCallback((updates: any) => {
        const currentBlock = localBlockRef.current
        const updatedBlock = { ...currentBlock, ...updates }
        setLocalBlock(updatedBlock)
        localBlockRef.current = updatedBlock
        updateBlock(id, updatedBlock)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        const currentBlock = localBlockRef.current
        if (currentBlock[key] === value) return
        saveBlock({ [key]: value })
    }, [saveBlock])

    const handleListChange = useCallback((listKey: string, index: number, value: string) => {
        const currentBlock = localBlockRef.current
        const list = [...(currentBlock[listKey] || [])]
        if (list[index] === value) return
        list[index] = value
        saveBlock({ [listKey]: list })
    }, [saveBlock])

    const handleAddItem = (listKey: string) => {
        const currentBlock = localBlockRef.current
        const defaultValue = "New Item"
        const list = [...(currentBlock[listKey] || [])]
        const newItem = `<a href="#">${defaultValue}</a>`
        list.push(newItem)
        saveBlock({ [listKey]: list })
    }

    const handleRemoveItem = (listKey: string, index: number) => {
        const currentBlock = localBlockRef.current
        const list = [...(currentBlock[listKey] || [])]
        list.splice(index, 1)
        saveBlock({ [listKey]: list })
    }

    const handleLogoUpdate = (type: 'icon' | 'image', value: string) => {
        saveBlock({ logoType: type, logoValue: value })
    }

    // Initialize defaults
    useEffect(() => {
        const updates: any = {}
        if (!localBlock.legalLinks) updates.legalLinks = defaultLegal.map(t => `<a href="#">${t}</a>`)
        if (!localBlock.sitemapLinks) updates.sitemapLinks = defaultSitemap.map(t => `<a href="#">${t}</a>`)
        if (!localBlock.companyLines) updates.companyLines = defaultCompany
        if (!localBlock.socialLinks) updates.socialLinks = defaultSocial
        if (!localBlock.brandTitle) updates.brandTitle = "Alpha Minoris"
        if (!localBlock.logoType) {
            updates.logoType = 'image'
            updates.logoValue = ''
        }

        if (Object.keys(updates).length > 0) {
            // Only apply if missing keys
            const merged = { ...localBlock, ...updates }
            // Check if actually different to avoid loop
            if (JSON.stringify(merged) !== JSON.stringify(localBlock)) {
                saveBlock(merged)
            }
        }
    }, [localBlock, defaultLegal, defaultSitemap, defaultCompany, defaultSocial, saveBlock])

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

            <div className={cn(
                "container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16",
                localBlock.align === 'left' ? "text-left" :
                    localBlock.align === 'right' ? "text-right" :
                        "text-center md:text-left" // Default footer behavior
            )}>

                {/* Column 1: Brand & Tagline */}
                <div className={cn(
                    "space-y-6",
                    localBlock.align === 'left' ? "flex flex-col items-start" :
                        localBlock.align === 'right' ? "flex flex-col items-end" :
                            "flex flex-col items-center md:items-start"
                )}>
                    <div className="w-32 h-32 relative">
                        <EditableAsset
                            type={localBlock.logoType || 'image'}
                            value={localBlock.logoValue || ''}
                            onChange={handleLogoUpdate}
                            isEditMode={isEditMode}
                            placeholderText="LOGO"
                            className="bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-4">
                        <EditableText
                            tagName={localBlock.level || 'h3'}
                            value={localBlock.brandTitle || "Alpha Minoris"}
                            onChange={(v) => handleTextChange('brandTitle', v)}
                            className="text-xl font-bold text-white font-heading"
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localBlock.fontFamily,
                                fontSize: localBlock.fontSize,
                                color: localBlock.color
                            }}
                        />
                        <EditableText
                            value={localBlock.tagline || "Building the automated future, one agent at a time."}
                            onChange={(v) => handleTextChange('tagline', v)}
                            className="leading-relaxed focus:text-white block"
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localBlock.fontFamily,
                                fontSize: localBlock.fontSize,
                                color: localBlock.color
                            }}
                        />
                    </div>
                </div>

                {/* Column 2: Legal */}
                <div className="space-y-4 flex flex-col">
                    <div className="flex items-center">
                        <EditableText
                            tagName="h4"
                            value={localBlock.legalTitle || "Legal"}
                            onChange={(v) => handleTextChange('legalTitle', v)}
                            className="font-bold text-white uppercase tracking-wider text-xs w-fit"
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localBlock.fontFamily,
                                fontSize: localBlock.fontSize,
                                color: localBlock.color
                            }}
                        />
                        <AddButton onClick={() => handleAddItem('legalLinks')} isEditMode={isEditMode} />
                    </div>
                    {Array.isArray(localBlock.legalLinks) && localBlock.legalLinks.map((html: string, i: number) => (
                        <div key={i} className="flex items-center group/item w-fit">
                            <EditableText
                                value={html}
                                onChange={(v) => handleListChange('legalLinks', i, v)}
                                className="inline-block hover:text-white transition-colors"
                                isEditMode={isEditMode}
                                onFocus={onTextFocus}
                                onBlur={onTextBlur}
                                style={{
                                    fontFamily: localBlock.fontFamily,
                                    fontSize: localBlock.fontSize,
                                    color: localBlock.color
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
                            value={localBlock.companyTitle || "Company"}
                            onChange={(v) => handleTextChange('companyTitle', v)}
                            className="font-bold text-white uppercase tracking-wider text-xs w-fit"
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            style={{
                                fontFamily: localBlock.fontFamily,
                                fontSize: localBlock.fontSize,
                                color: localBlock.color
                            }}
                        />
                        <AddButton onClick={() => handleAddItem('companyLines')} isEditMode={isEditMode} />
                    </div>
                    {Array.isArray(localBlock.companyLines) && localBlock.companyLines.map((html: string, i: number) => (
                        <div key={i} className="flex items-center group/item w-fit">
                            <EditableText
                                value={html}
                                onChange={(v) => handleListChange('companyLines', i, v)}
                                className="block"
                                isEditMode={isEditMode}
                                onFocus={onTextFocus}
                                onBlur={onTextBlur}
                                style={{
                                    fontFamily: localBlock.fontFamily,
                                    fontSize: localBlock.fontSize,
                                    color: localBlock.color
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
                    {Array.isArray(localBlock.sitemapLinks) && localBlock.sitemapLinks.map((html: string, i: number) => (
                        <div key={i} className="flex items-center group/item w-fit">
                            <EditableText
                                value={html}
                                onChange={(v) => handleListChange('sitemapLinks', i, v)}
                                className="inline-block hover:text-white transition-colors"
                                isEditMode={isEditMode}
                                onFocus={onTextFocus}
                                onBlur={onTextBlur}
                                style={{
                                    fontFamily: localBlock.fontFamily,
                                    fontSize: localBlock.fontSize,
                                    color: localBlock.color
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
                    {Array.isArray(localBlock.socialLinks) && localBlock.socialLinks.map((html: string, i: number) => (
                        <div key={i} className="flex items-center group/item">
                            <EditableText
                                value={html}
                                onChange={(v) => handleListChange('socialLinks', i, v)}
                                className="hover:text-white transition-colors"
                                isEditMode={isEditMode}
                                onFocus={onTextFocus}
                                onBlur={onTextBlur}
                                style={{
                                    fontFamily: localBlock.fontFamily,
                                    fontSize: localBlock.fontSize,
                                    color: localBlock.color
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


