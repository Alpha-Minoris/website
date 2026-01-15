'use client'

import { BlockProps } from './types'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BlockRenderer } from './block-renderer'
import { useEditorStore } from '@/lib/stores/editor-store'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { TextToolbarUI } from '@/components/editor/text-toolbar'
import { IconToolbar } from '@/components/editor/icon-toolbar'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { lazy, Suspense, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'

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
    const { isEditMode, selectedBlockId, updateBlock, activeDragId } = useEditorStore()
    const [isFlipped, setIsFlipped] = useState(false)
    const [activeEdit, setActiveEdit] = useState<'front' | 'back' | null>(null)
    const [activeIconEdit, setActiveIconEdit] = useState<'front' | 'back' | null>(null)

    // Parse settings
    const mode = settings?.mode || 'simple' // 'simple' | 'flip'
    const variant = settings?.variant || 'glass'
    const width = settings?.width || '100%'
    const minHeight = settings?.minHeight || '200px'
    const bgColor = settings?.backgroundColor
    const textColor = settings?.color

    const frontBlocks = Array.isArray(content) ? content : []
    const backBlocks = Array.isArray(settings?.backContent) ? settings.backContent : []

    const cardClasses = cn(
        "relative transition-all duration-300 rounded-xl",
        (!isEditMode && mode !== 'flip') && "overflow-hidden",
        isEditMode && "overflow-visible",
        !bgColor && "bg-white/5 backdrop-blur-md border border-white/10 shadow-xl",
        variant === 'outline' && "bg-transparent border-2 border-dashed border-zinc-700",
        mode === 'flip' && "transform-style-3d transition-transform duration-700",
        isFlipped && mode === 'flip' && "rotate-y-180",
        mode === 'flip' && "bg-transparent border-none shadow-none backdrop-blur-none"
    )

    const isSelected = selectedBlockId === id
    const ref = React.useRef<HTMLDivElement>(null)

    // Droppable for Front
    const { setNodeRef: setFrontRef } = useDroppable({
        id: `${id}-front`,
        data: {
            type: 'container',
            isCard: true,
            containerId: id,
            cardId: id,
            face: 'front',
            // Pass current relative coordinates to help drop logic
            x: settings?.x || 0,
            y: settings?.y || 0
        },
        disabled: !isEditMode || activeDragId === id
    })

    // Droppable for Back
    const { setNodeRef: setBackRef } = useDroppable({
        id: `${id}-back`,
        data: {
            type: 'container',
            isCard: true,
            containerId: id,
            cardId: id,
            face: 'back'
        },
        disabled: !isEditMode || activeDragId === id
    })

    // Helpers
    const handleTextSave = (face: 'front' | 'back', html: string) => {
        const key = face === 'front' ? 'linkTextFront' : 'linkTextBack'
        updateBlock(id, { settings: { ...settings, [key]: html } })
        import('@/actions/block-actions').then(({ updateBlockContent }) => {
            if (sectionId) updateBlockContent(sectionId, id, { settings: { ...settings, [key]: html } })
        })
    }

    const handleLinkUpdate = (face: 'front' | 'back' | null, updates: any) => {
        if (!face) return
        const key = face === 'front' ? 'linkFrontSettings' : 'linkBackSettings'
        const newSettings = { ...settings, [key]: { ...(settings?.[key] || {}), ...updates } }
        updateBlock(id, { settings: newSettings })
        import('@/actions/block-actions').then(({ updateBlockContent }) => {
            if (sectionId) updateBlockContent(sectionId, id, { settings: newSettings })
        })
    }

    const handleIconUpdate = (face: 'front' | 'back' | null, updates: any) => {
        if (!face) return
        const key = face === 'front' ? 'iconFrontSettings' : 'iconBackSettings'
        const newSettings = { ...settings, [key]: { ...(settings?.[key] || {}), ...updates } }
        updateBlock(id, { settings: newSettings })
        import('@/actions/block-actions').then(({ updateBlockContent }) => {
            if (sectionId) updateBlockContent(sectionId, id, { settings: newSettings })
        })
    }

    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (!ref.current) return

        const startX = e.clientX
        const startY = e.clientY
        const startRect = ref.current.getBoundingClientRect()
        const startW = startRect.width
        const startH = startRect.height

        const doDrag = (ev: MouseEvent) => {
            const dx = ev.clientX - startX
            const dy = ev.clientY - startY
            let newW = startW
            let newH = startH

            if (direction.includes('e')) newW = startW + dx
            if (direction.includes('w')) newW = startW - dx
            if (direction.includes('s')) newH = startH + dy
            if (direction.includes('n')) newH = startH - dy

            if (ref.current) {
                if (direction.includes('e') || direction.includes('w')) ref.current.style.width = `${Math.max(100, newW)}px`
                if (direction.includes('s') || direction.includes('n')) ref.current.style.minHeight = `${Math.max(100, newH)}px`
            }
        }

        const stopDrag = () => {
            window.removeEventListener('mousemove', doDrag)
            window.removeEventListener('mouseup', stopDrag)
            if (ref.current && sectionId) {
                const newSettings = {
                    ...settings,
                    width: ref.current.style.width,
                    minHeight: ref.current.style.minHeight
                }
                updateBlock(id, { settings: newSettings })
                import('@/actions/block-actions').then(({ updateBlockContent }) => {
                    updateBlockContent(sectionId, id, { settings: newSettings })
                })
            }
        }
        window.addEventListener('mousemove', doDrag)
        window.addEventListener('mouseup', stopDrag)
    }

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
                    transformStyle: mode === 'flip' ? 'preserve-3d' : undefined
                }}
            >
                {mode === 'simple' ? (
                    <CardContent className="p-6 relative" ref={setFrontRef}>
                        {frontBlocks.length > 0 ? (
                            <BlockRenderer blocks={frontBlocks} sectionId={sectionId} layoutMode="canvas" />
                        ) : (
                            <div className="text-zinc-500 text-center py-8 border-2 border-dashed border-zinc-800/50 rounded-lg">
                                Empty Card
                            </div>
                        )}
                    </CardContent>
                ) : (
                    <>
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
                            <CardContent className="p-6 h-full flex flex-col relative group/front" ref={setFrontRef}>
                                {frontBlocks.length > 0 ? (
                                    <BlockRenderer blocks={frontBlocks} sectionId={sectionId} layoutMode="canvas" />
                                ) : (
                                    <div className="text-zinc-500 text-center flex-1 flex items-center justify-center border-2 border-dashed border-zinc-800/20 m-4 rounded">
                                        Front Content
                                    </div>
                                )}

                                {/* Bottom Right Flip Trigger (Front) */}
                                <div
                                    className="absolute bottom-4 right-4 text-xs text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors duration-300 cursor-pointer z-50"
                                    onClick={(e) => {
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
                                            onClick={(e) => e.stopPropagation()}
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
                                "absolute inset-0 flex flex-col bg-zinc-900 transition-all duration-700",
                                isFlipped ? "z-20 pointer-events-auto" : "z-0 pointer-events-none"
                            )}
                            style={{
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transformStyle: 'preserve-3d',
                                backgroundColor: bgColor || undefined
                            }}
                        >
                            <div className="absolute top-2 right-2 z-20">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setIsFlipped(false) }}>
                                    ✕
                                </Button>
                            </div>

                            <CardContent className="p-6 h-full flex flex-col relative group/back" ref={setBackRef}>
                                {backBlocks.length > 0 ? (
                                    <BlockRenderer blocks={backBlocks} sectionId={sectionId} layoutMode="canvas" />
                                ) : (
                                    <div className="text-zinc-500 text-center flex-1 flex items-center justify-center border-2 border-dashed border-zinc-800/20 m-4 rounded">
                                        Back Content
                                    </div>
                                )}

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

            {isEditMode && isSelected && (
                <>
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
                    {['n', 'e', 's', 'w'].map((dir) => (
                        <div
                            key={dir}
                            className={cn(
                                "absolute bg-transparent z-[55]",
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
