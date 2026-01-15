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
        // Only clip overflow if NOT in edit mode AND NOT in flip mode. 
        // 3D children need to be visible outside if we rotate, though usually inside.
        // But overflow:hidden KILLS preserve-3d on some browsers.
        (!isEditMode && mode !== 'flip') && "overflow-hidden",
        isEditMode && "overflow-visible",

        // Glassmorphism default
        !bgColor && "bg-white/5 backdrop-blur-md border border-white/10 shadow-xl",
        variant === 'outline' && "bg-transparent border-2 border-dashed border-zinc-700",
        // Flip specifics
        mode === 'flip' && "transform-style-3d transition-transform duration-700",
        isFlipped && mode === 'flip' && "rotate-y-180",
        // In flip mode, the container must be transparent; faces hold the styling.
        mode === 'flip' && "bg-transparent border-none shadow-none backdrop-blur-none"
    )

    const isSelected = selectedBlockId === id
    const ref = React.useRef<HTMLDivElement>(null)

    // ... (keep listener logic)

    // listeners...

    return (
        <div
            ref={ref}
            className="relative group p-0 border-0 transition-all mx-auto perspective-1000"
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
                    backgroundColor: mode === 'flip' ? undefined : bgColor,
                    color: textColor,
                    borderColor: mode === 'flip' ? undefined : settings?.borderColor,
                    transformStyle: mode === 'flip' ? 'preserve-3d' : undefined // Explicit reuse
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
                    // Flip Mode Structure
                    <>
                        {/* Note: In CSS 3D transform, we need distinct faces. 
                           If we rotate parent, we rotate everything. 
                           Usually: Container -> Face Front, Face Back.
                           If parent `cardClasses` has rotate-y-180, ensure faces behave.
                        */}

                        {/* Front Face */}
                        <div
                            className={cn(
                                "absolute inset-0 flex flex-col transition-all duration-700",
                                !isFlipped ? "z-20 pointer-events-auto" : "z-0 pointer-events-none"
                            )}
                            style={{
                                transform: 'rotateY(0deg)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transformStyle: 'preserve-3d'
                            }}
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
                                "absolute inset-0 flex flex-col bg-zinc-900 transition-all duration-700", // Force opaque bg-zinc-900 to hide front face
                                isFlipped ? "z-20 pointer-events-auto" : "z-0 pointer-events-none"
                            )}
                            style={{
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transformStyle: 'preserve-3d',
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
                    </>
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
