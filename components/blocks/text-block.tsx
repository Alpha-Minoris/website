'use client'

import React, { useRef, useState, useCallback } from 'react'
import { BlockProps } from './types'
import { cn } from '@/lib/utils'

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

import { useEditorStore } from '@/lib/stores/editor-store'

export function TextBlock(block: BlockProps) {
    const { id, content } = block
    const { isEditMode } = useEditorStore()
    const Tag = (block.level === 'label' ? 'span' : block.level) || 'h2'

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

    // 3. MutationObserver for execCommand/Toolbar changes
    // This ensures isDirty is set true even if onInput doesn't fire (e.g. from Toolbar buttons)
    React.useEffect(() => {
        if (!elementRef.current) return

        const observer = new MutationObserver(() => {
            isDirty.current = true
            // We don't auto-save here to avoid spamming, handleBlur will catch it.
            // But we MUST mark dirty so useLayoutEffect doesn't overwrite us with stale props.
        })

        observer.observe(elementRef.current, {
            characterData: true,
            childList: true,
            subtree: true,
            attributes: true
        })

        return () => observer.disconnect()
    }, [])

    const handleInput = useCallback(() => {
        isDirty.current = true
    }, [])

    const handleBlur = useCallback(async (e: React.FocusEvent<HTMLElement>) => {
        const newHtml = e.currentTarget.innerHTML
        if (newHtml !== lastContentHtml.current) {
            lastContentHtml.current = newHtml
            isDirty.current = false
        }
    }, [id])

    return (
        <Tag
            ref={(node: HTMLElement | null) => {
                elementRef.current = node
            }}
            className={cn(
                "w-fit max-w-full outline-none transition-colors duration-200 min-w-[1em] empty:before:content-['Type...'] empty:before:text-gray-400",
                {
                    'text-left': block.align === 'left',
                    'text-center': block.align === 'center' || !block.align,
                    'text-right': block.align === 'right',
                    'text-justify': block.align === 'justify',
                    'font-bold': block.bold,
                    'italic': block.italic,
                    'text-4xl font-extrabold': Tag === 'h1',
                    'text-3xl font-bold': Tag === 'h2',
                    'text-2xl font-semibold': Tag === 'h3',
                    'text-xl font-medium': Tag === 'h4',
                    'text-lg font-medium': Tag === 'h5',
                    'text-base font-medium': block.level === 'h6',
                    'text-base font-normal max-w-prose leading-relaxed': block.level === 'p',
                    'text-xs font-semibold uppercase tracking-wider text-muted-foreground': block.level === 'label',
                }
            )}
            style={{
                color: block.color,
                fontSize: block.fontSize,
                backgroundColor: block.backgroundColor,
                fontFamily: block.fontFamily
            }}
            contentEditable={isEditMode}
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={handleBlur}
            onClick={(e) => {
                if (!isEditMode) {
                    const link = (e.target as HTMLElement).closest('a')
                    if (link) {
                        const href = link.getAttribute('href')
                        if (href) {
                            if (href.startsWith('#')) {
                                // Internal anchor, let default handle or scroll manually? 
                                // Default usually works unless prevented.
                            } else {
                                // External or absolute
                                window.open(href, '_blank')
                            }
                        }
                    }
                } else {
                    // In edit mode, maybe prevent default? TextToolbar usually handles it by not setting target.
                    // But if user clicks link in edit mode, capturing it prevents navigation which is GOOD.
                    const link = (e.target as HTMLElement).closest('a')
                    if (link) e.preventDefault()
                }
            }}
        // IMPORTANT: No dangerouslySetInnerHTML here. 
        // We manage content manually to prevent React re-renders from clobbering cursor/selection.
        // React will only manage className and style.
        />
    )
}


