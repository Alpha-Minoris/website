'use client'

import React, { useRef, useState, useCallback } from 'react'
import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { updateBlockContent } from '@/actions/block-actions'

interface TextSettings {
    level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'label'
    align?: 'left' | 'center' | 'right' | 'justify'
    color?: string
    bold?: boolean
    italic?: boolean
    fontSize?: string
    backgroundColor?: string
    fontFamily?: string
}

export function TextBlock({ id, content, settings, sectionId }: BlockProps) {
    const s = settings as TextSettings || {}
    const Tag = (s.level === 'label' ? 'span' : s.level) || 'h2'

    // HTML from props (source of truth from DB)
    const contentHtml = typeof content === 'string' ? content : 'Heading Text'

    const elementRef = useRef<HTMLElement>(null)
    const isDirty = useRef(false)
    const lastContentHtml = useRef(contentHtml)

    // 1. Initial Content Injection & Remote Sync
    // We use useLayoutEffect to ensure content is there before paint
    React.useLayoutEffect(() => {
        if (!elementRef.current) return

        // If we are NOT dirty (user hasn't typed locally), we accept the prop update.
        // This handles:
        // - Initial render
        // - Undo/Redo (where content prop changes back)
        // - Remote updates from other users
        if (!isDirty.current && elementRef.current.innerHTML !== contentHtml) {
            elementRef.current.innerHTML = contentHtml
            lastContentHtml.current = contentHtml
        }
    }, [contentHtml])
    // ^ Dependency on contentHtml ensures we update if prop changes (and we aren't dirty)

    // 2. Handle Tag Change (e.g. h1 -> h2)
    // React will unmount the old node and mount a new one.
    // We need to make sure the NEW node gets the content.
    // The useLayoutEffect above handles this naturally because 'elementRef' changes.

    const handleInput = useCallback(() => {
        isDirty.current = true
    }, [])

    const handleBlur = useCallback(async (e: React.FocusEvent<HTMLElement>) => {
        if (!sectionId) return

        const newHtml = e.currentTarget.innerHTML
        // Save if different from what we thought we had
        if (newHtml !== lastContentHtml.current) {
            try {
                // Determine complexity: if simple string, save as simple string? 
                // For now always save as string (which contains HTML tags).
                await updateBlockContent(sectionId, id, { content: newHtml })
                lastContentHtml.current = newHtml
                isDirty.current = false // Reset dirty state after save confirm? 
                // Actually, safer to keep dirty until prop comes back? 
                // No, once saved, we expect prop to match eventually. 
                // But better to leave isDirty=false so we can accept the *next* prop update 
                // which should match what we just saved.
            } catch (err) {
                console.error("Failed to save text", err)
            }
        }
    }, [sectionId, id])

    return (
        <Tag
            ref={(node: HTMLElement | null) => {
                elementRef.current = node
            }}
            className={cn(
                "w-fit max-w-full outline-none transition-colors duration-200 min-w-[1em] empty:before:content-['Type...'] empty:before:text-gray-400",
                {
                    'text-left': s.align === 'left',
                    'text-center': s.align === 'center' || !s.align,
                    'text-right': s.align === 'right',
                    'text-justify': s.align === 'justify',
                    'font-bold': s.bold,
                    'italic': s.italic,
                    'text-4xl font-extrabold': Tag === 'h1',
                    'text-3xl font-bold': Tag === 'h2',
                    'text-2xl font-semibold': Tag === 'h3',
                    'text-xl font-medium': Tag === 'h4',
                    'text-lg font-medium': Tag === 'h5',
                    'text-base font-medium': s.level === 'h6',
                    'text-base font-normal max-w-prose leading-relaxed': s.level === 'p',
                    'text-xs font-semibold uppercase tracking-wider text-muted-foreground': s.level === 'label',
                }
            )}
            style={{
                color: s.color,
                fontSize: s.fontSize,
                backgroundColor: s.backgroundColor,
                fontFamily: s.fontFamily
            }}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={handleBlur}
        // IMPORTANT: No dangerouslySetInnerHTML here. 
        // We manage content manually to prevent React re-renders from clobbering cursor/selection.
        // React will only manage className and style.
        />
    )
}
