'use client'

import { BlockProps } from './types'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
// We will need to import BlockRenderer recursively.
// Circular dependency might be an issue, but usually fine in React if handled carefully or separate component.
// Let's assume we can import BlockRenderer. If not, we extract the rendering list logic.
import { BlockRenderer } from './block-renderer'
import { useEditorStore } from '@/lib/stores/editor-store'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { TextToolbarUI } from '@/components/editor/text-toolbar'
import { IconToolbar } from '@/components/editor/icon-toolbar'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { lazy, Suspense, useMemo } from 'react'

const IconDisplay = ({ name, className, style }: { name?: string, className?: string, style?: any }) => {
    const LucideIcon = useMemo(() => {
        if (!name) return null
        const icon = dynamicIconImports[name as keyof typeof dynamicIconImports]
        if (!icon) return null
        return lazy(icon)
    }, [name])

    if (!name || !LucideIcon) return <RefreshCw className={className} style={style} />

    return (
        <Suspense fallback={<div className={className} style={style} />}>
            <LucideIcon className={className} style={style} />
        </Suspense>
    )
}

export function CardBlock({ id, content, settings, sectionId }: BlockProps) {
    const { isEditMode, selectedBlockId, updateBlock } = useEditorStore()
    const [isFlipped, setIsFlipped] = useState(false)
    const [activeEdit, setActiveEdit] = useState<'front' | 'back' | null>(null)
    const [activeIconEdit, setActiveIconEdit] = useState<'front' | 'back' | null>(null)

    // Sync state if settings change externally
    React.useEffect(() => {
        // Removed frontText/backText state, so this useEffect is no longer needed for them.
        // The contentEditable elements will directly use settings.linkTextFront/Back
        // and TextToolbarUI will use settings.linkFrontSettings/BackSettings.
    }, [settings?.linkTextFront, settings?.linkTextBack])

    // Parse settings
    const mode = settings?.mode || 'simple' // 'simple' | 'flip'
    // Default to glass if not specified for better style match
    const variant = settings?.variant || 'glass'
    const width = settings?.width || '100%'
    const minHeight = settings?.minHeight || '200px'
    const bgColor = settings?.backgroundColor
    const textColor = settings?.color

    // Content: 'content' is Front, 'settings.contentBack' is Back (if implementing separation)
    // For now, let's keep it simple: If in Flip Mode, we need to KNOW which blocks are front vs back.
    // The current data model likely just pushes all children to `content`.
    // We need a way to split them. 
    // TEMPORARY FIX: Render same content for now but give user ability to distinguish via UI? 
    // No, user said "both side are the same".
    // Let's implement a 'BackContent' array in settings for real separation.

    const frontBlocks = Array.isArray(content) ? content : []
    // If settings.backContent exists use it, else empty
    const backBlocks = Array.isArray(settings?.backContent) ? settings.backContent : []

    const cardClasses = cn(
        "relative transition-all duration-300 rounded-xl",
        // Only clip overflow if NOT in edit mode, so toolbars can pop out. 
        // Actually, we want rounded corners. 
        // If we remove overflow-hidden, rounded corners might get lost for content. 
        // But for toolbars (which are likely absolutely positioned relative to this), they need to escape.
        // Better approach: EditorBlockWrapper handles toolbars OUTSIDE this component. 
        // Wait, BlockRenderer renders EditorBlockWrapper. CardBlock is INSIDE EditorBlockWrapper? 
        // No, BlockRenderer map -> EditorBlockWrapper -> BlockComponent (CardBlock).
        // CardBlock renders children via BlockRenderer. 
        // So Children's Toolbars are inside CardBlock. 
        // So overflow-hidden HERE stays. 
        // We must switch to using Portals for toolbars in EditorBlockWrapper.

        // TEMPORARY: disable overflow hidden in edit mode to see if it fixes it.
        !isEditMode && "overflow-hidden",
        isEditMode && "overflow-visible", // Allow toolbars to break out

        // Glassmorphism default
        !bgColor && "bg-white/5 backdrop-blur-md border border-white/10 shadow-xl",
        variant === 'outline' && "bg-transparent border-2 border-dashed border-zinc-700",
        // Flip specifics
        mode === 'flip' && "transform-style-3d transition-transform duration-700",
        isFlipped && mode === 'flip' && "rotate-y-180"
    )

    const isSelected = selectedBlockId === id
    const ref = React.useRef<HTMLDivElement>(null)

    // Listen for reverse flip from back side triggers
    React.useEffect(() => {
        const handleReverse = () => setIsFlipped(false)
        const node = ref.current
        if (node) {
            node.addEventListener('card-flip-reverse', handleReverse)
        }
        return () => {
            if (node) node.removeEventListener('card-flip-reverse', handleReverse)
        }
    }, [])

    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.preventDefault()
        e.stopPropagation()
        const startX = e.clientX
        const startY = e.clientY
        const startRect = ref.current?.getBoundingClientRect()
        if (!startRect) return

        const startW = startRect.width
        const startH = startRect.height

        const doDrag = (ev: MouseEvent) => {
            if (!ref.current) return

            const dx = ev.clientX - startX
            const dy = ev.clientY - startY

            let newW = startW
            let newH = startH

            if (direction.includes('e')) newW = startW + dx
            if (direction.includes('w')) newW = startW - dx // Logic for left/west dragging requires position shift if absolute, but for flow defaults we might just clamp or need margin. 
            // NOTE: Flow layout left-resize is tricky without changing alignment/margin. 
            // For now, let's assume 'w' just changes width but visually it grows to right unless flex container justifies it. 
            // Actually, if we want true 'w' resize in flow, simple width change works but grows to right. 
            // Google Slides is absolute. Here we are relative. 
            // Let's stick to Right/Bottom mainly, but allow W to change width (effectively growing right).

            if (direction.includes('s')) newH = startH + dy
            if (direction.includes('n')) newH = startH - dy

            if (ref.current) {
                if (direction.includes('e') || direction.includes('w')) ref.current.style.width = `${Math.max(100, newW)}px`
                if (direction.includes('s') || direction.includes('n')) ref.current.style.minHeight = `${Math.max(100, newH)}px`
            }
        }

        const stopDrag = async () => {
            window.removeEventListener('mousemove', doDrag)
            window.removeEventListener('mouseup', stopDrag)
            if (sectionId && ref.current) {
                // Dynamic import to avoid cycles if any (though usually safe here)
                const { updateBlockContent } = await import('@/actions/block-actions')
                await updateBlockContent(sectionId, id, {
                    settings: {
                        ...settings,
                        width: ref.current.style.width,
                        minHeight: ref.current.style.minHeight
                    }
                })
            }
        }

        window.addEventListener('mousemove', doDrag)
        window.addEventListener('mouseup', stopDrag)
    }

    // Helper to update link settings
    const handleLinkUpdate = async (side: 'front' | 'back', updates: any) => {
        const key = side === 'front' ? 'linkFrontSettings' : 'linkBackSettings'
        const currentSettings = settings?.[key] || {}
        const newSettings = { ...currentSettings, ...updates }

        // Optimistic update
        if (updateBlock) {
            updateBlock(id, { settings: { ...settings, [key]: newSettings } })
        }

        // Server update
        if (sectionId) {
            const { updateBlockContent } = await import('@/actions/block-actions')
            await updateBlockContent(sectionId, id, {
                settings: { ...settings, [key]: newSettings }
            })
        }
    }

    // Helper to save text content
    const handleTextSave = async (side: 'front' | 'back', html: string) => {
        const key = side === 'front' ? 'linkTextFront' : 'linkTextBack'
        if (sectionId) {
            const { updateBlockContent } = await import('@/actions/block-actions')
            await updateBlockContent(sectionId, id, {
                settings: { ...settings, [key]: html }
            })
        }
    }

    // Helper to update icon settings
    const handleIconUpdate = async (side: 'front' | 'back', updates: any) => {
        const key = side === 'front' ? 'iconFrontSettings' : 'iconBackSettings'
        // Store icon settings separately from text settings for clarity, 
        // or merge them? User said "icon should also conform with text color OR allow changing".
        // Let's store in a dedicated object.
        const currentSettings = settings?.[key] || {}
        const newSettings = { ...currentSettings, ...updates }

        if (updateBlock) {
            updateBlock(id, { settings: { ...settings, [key]: newSettings } })
        }
        if (sectionId) {
            const { updateBlockContent } = await import('@/actions/block-actions')
            await updateBlockContent(sectionId, id, {
                settings: { ...settings, [key]: newSettings }
            })
        }
    }

    return (
        <div
            ref={ref}
            className="relative group p-0 border-0 transition-all mx-auto"
            style={{ width: width, minHeight: minHeight }}
        >
            {/* Edit Controls for Flip */}
            {isEditMode && isSelected && mode === 'flip' && (
                <div className="absolute -top-12 right-0 z-50 flex gap-2">
                    <Button
                        size="sm"
                        variant={!isFlipped ? "secondary" : "ghost"}
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(false) }}
                        className="text-xs h-8"
                    >
                        Front
                    </Button>
                    <Button
                        size="sm"
                        variant={isFlipped ? "secondary" : "ghost"}
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(true) }}
                        className="text-xs h-8"
                    >
                        Back
                    </Button>
                </div>
            )}

            {/* Render Toolbar if active - Positioned below loaded text */}
            {isEditMode && activeEdit && (
                <div className="absolute top-full mt-4 left-0 right-0 z-[100] flex justify-center">
                    <TextToolbarUI
                        settings={activeEdit === 'front' ? (settings?.linkFrontSettings || {}) : (settings?.linkBackSettings || {})}
                        onUpdate={(u) => handleLinkUpdate(activeEdit, u)}
                    // No delete for labels
                    />
                </div>
            )}

            {/* Render Icon Toolbar if active - Positioned below icon */}
            {isEditMode && activeIconEdit && (
                <div className="absolute top-full mt-4 right-0 z-[100]">
                    <IconToolbar
                        settings={activeIconEdit === 'front' ? (settings?.iconFrontSettings || {}) : (settings?.iconBackSettings || {})}
                        onUpdate={(u) => handleIconUpdate(activeIconEdit, u)}
                    />
                </div>
            )}

            <div
                className={cardClasses}
                style={{
                    minHeight,
                    backgroundColor: bgColor,
                    color: textColor,
                    borderColor: settings?.borderColor
                }}
            >
                {mode === 'simple' ? (
                    <CardContent className="p-6">
                        {frontBlocks.length > 0 ? (
                            <BlockRenderer blocks={frontBlocks} sectionId={sectionId} />
                        ) : (
                            <div className="text-zinc-500 text-center py-8 border-2 border-dashed border-zinc-800/50 rounded-lg">
                                Empty Card
                            </div>
                        )}
                    </CardContent>
                ) : (
                    // Flip Mode Structure
                    <div className="relative w-full h-full text-left" style={{ minHeight }}>
                        {/* Note: In CSS 3D transform, we need distinct faces. 
                           If we rotate parent, we rotate everything. 
                           Usually: Container -> Face Front, Face Back.
                           If parent `cardClasses` has rotate-y-180, ensure faces behave.
                        */}

                        {/* Front Face */}
                        <div
                            className={cn(
                                "absolute inset-0 backface-hidden flex flex-col transition-all duration-700",
                                !isFlipped ? "z-20 pointer-events-auto" : "z-0 pointer-events-none"
                            )}
                            style={{ transform: 'rotateY(0deg)' }}
                        >
                            <CardContent className="p-6 h-full flex flex-col relative group/front">
                                {frontBlocks.length > 0 ? (
                                    <BlockRenderer blocks={frontBlocks} sectionId={sectionId} />
                                ) : (
                                    <div className="text-zinc-500 text-center flex-1 flex items-center justify-center border-2 border-dashed border-zinc-800/20 m-4 rounded">
                                        Front Content
                                    </div>
                                )}

                                {/* Bottom Right Flip Trigger (Front) */}
                                <div
                                    className="absolute bottom-4 right-4 text-xs text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors duration-300 cursor-pointer z-50"
                                    onClick={(e) => {
                                        // If clicking the container/icon, toggle flip
                                        // Unless target is the input
                                        if (activeEdit !== 'front') {
                                            e.stopPropagation()
                                            setIsFlipped(true)
                                        }
                                    }}
                                >
                                    {isEditMode ? (
                                        <div
                                            contentEditable
                                            className="uppercase tracking-widest text-[10px] w-auto min-w-[20px] focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 transition-all"
                                            style={{
                                                ...(settings?.linkFrontSettings || {}),
                                                // Map standard styles
                                                color: settings?.linkFrontSettings?.color,
                                                fontSize: settings?.linkFrontSettings?.fontSize,
                                                backgroundColor: settings?.linkFrontSettings?.backgroundColor,
                                            }}
                                            dangerouslySetInnerHTML={{ __html: settings?.linkTextFront || "FLIP" }}
                                            onFocus={(e) => {
                                                e.stopPropagation()
                                                setActiveEdit('front')
                                                setActiveIconEdit(null)
                                            }}
                                            onBlur={(e) => {
                                                setActiveEdit(null)
                                                handleTextSave('front', e.currentTarget.innerHTML)
                                            }}
                                            onClick={(e) => e.stopPropagation()} // Stop flip when clicking text
                                            suppressContentEditableWarning
                                        />
                                    ) : (
                                        <span
                                            className="uppercase tracking-widest text-[10px]"
                                            style={settings?.linkFrontSettings}
                                            dangerouslySetInnerHTML={{ __html: settings?.linkTextFront || "FLIP" }}
                                        />
                                    )}
                                    <div
                                        onClick={(e) => {
                                            if (isEditMode) {
                                                e.stopPropagation()
                                                setActiveIconEdit('front')
                                                setActiveEdit(null)
                                            }
                                        }}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <IconDisplay
                                            name={settings?.iconFrontSettings?.iconName}
                                            className="w-3 h-3"
                                            style={{ color: settings?.iconFrontSettings?.color || settings?.linkFrontSettings?.color }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </div>

                        {/* Back Face */}
                        <div
                            className={cn(
                                "absolute inset-0 backface-hidden flex flex-col bg-zinc-900 transition-all duration-700", // Force opaque bg-zinc-900 to hide front face
                                isFlipped ? "z-20 pointer-events-auto" : "z-0 pointer-events-none"
                            )}
                            style={{
                                transform: 'rotateY(180deg)',
                                backgroundColor: bgColor || undefined // Inherit or override if set
                            }}
                        >
                            {/* Close/Reverse Button on Back - Top Right (Keep as alternative) */}
                            <div className="absolute top-2 right-2 z-20">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setIsFlipped(false) }}>
                                    ✕
                                </Button>
                            </div>

                            <CardContent className="p-6 h-full flex flex-col relative group/back">
                                {backBlocks.length > 0 ? (
                                    <BlockRenderer blocks={backBlocks} sectionId={sectionId} />
                                ) : (
                                    <div className="text-zinc-500 text-center flex-1 flex items-center justify-center border-2 border-dashed border-zinc-800/20 m-4 rounded">
                                        Back Content
                                    </div>
                                )}

                                {/* Bottom Right Flip Trigger (Back) */}
                                <div
                                    className="absolute bottom-4 right-4 text-xs text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors duration-300 cursor-pointer z-50"
                                    onClick={(e) => {
                                        if (activeEdit !== 'back') {
                                            e.stopPropagation()
                                            setIsFlipped(false)
                                        }
                                    }}
                                >
                                    {isEditMode ? (
                                        <div
                                            contentEditable
                                            className="uppercase tracking-widest text-[10px] w-auto min-w-[20px] focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 transition-all"
                                            style={{
                                                ...(settings?.linkBackSettings || {}),
                                                color: settings?.linkBackSettings?.color,
                                                fontSize: settings?.linkBackSettings?.fontSize,
                                                backgroundColor: settings?.linkBackSettings?.backgroundColor,
                                            }}
                                            dangerouslySetInnerHTML={{ __html: settings?.linkTextBack || "BACK" }}
                                            onFocus={(e) => {
                                                e.stopPropagation()
                                                setActiveEdit('back')
                                                setActiveIconEdit(null)
                                            }}
                                            onBlur={(e) => {
                                                setActiveEdit(null)
                                                handleTextSave('back', e.currentTarget.innerHTML)
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            suppressContentEditableWarning
                                        />
                                    ) : (
                                        <span
                                            className="uppercase tracking-widest text-[10px]"
                                            style={settings?.linkBackSettings}
                                            dangerouslySetInnerHTML={{ __html: settings?.linkTextBack || "BACK" }}
                                        />
                                    )}
                                    <div
                                        onClick={(e) => {
                                            if (isEditMode) {
                                                e.stopPropagation()
                                                setActiveIconEdit('back')
                                                setActiveEdit(null)
                                            }
                                        }}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <IconDisplay
                                            name={settings?.iconBackSettings?.iconName}
                                            className="w-3 h-3 rotate-180"
                                            style={{ color: settings?.iconBackSettings?.color || settings?.linkBackSettings?.color }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </div>
                )}
            </div>

            {/* Resize Handles - 8 points */}
            {isEditMode && isSelected && (
                <>
                    {/* Corners */}
                    {['nw', 'ne', 'se', 'sw'].map((dir) => (
                        <div
                            key={dir}
                            className={cn(
                                "absolute w-3 h-3 bg-white border border-blue-500 rounded-full z-[60] opacity-0 group-hover:opacity-100 transition-opacity",
                                dir === 'nw' && "-top-1.5 -left-1.5 cursor-nw-resize",
                                dir === 'ne' && "-top-1.5 -right-1.5 cursor-ne-resize",
                                dir === 'se' && "-bottom-1.5 -right-1.5 cursor-se-resize",
                                dir === 'sw' && "-bottom-1.5 -left-1.5 cursor-sw-resize"
                            )}
                            onMouseDown={(e) => handleResizeStart(e, dir)}
                        />
                    ))}
                    {/* Sides */}
                    {['n', 'e', 's', 'w'].map((dir) => (
                        <div
                            key={dir}
                            className={cn(
                                "absolute bg-transparent z-[55]",
                                // Hit areas
                                dir === 'n' && "-top-1 left-0 right-0 h-2 cursor-n-resize",
                                dir === 'e' && "top-0 -right-1 bottom-0 w-2 cursor-e-resize",
                                dir === 's' && "-bottom-1 left-0 right-0 h-2 cursor-s-resize",
                                dir === 'w' && "top-0 -left-1 bottom-0 w-2 cursor-w-resize"
                            )}
                            onMouseDown={(e) => handleResizeStart(e, dir)}
                        />
                    ))}
                </>
            )}
        </div>
    )
}
