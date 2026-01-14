'use client'

import React, { useRef, useState } from 'react'
import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { updateBlockContent } from '@/actions/block-actions'

interface HeadingSettings {
    level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'label'
    align?: 'left' | 'center' | 'right' | 'justify'
    color?: string
    bold?: boolean
    italic?: boolean
    fontSize?: string
    backgroundColor?: string
    fontFamily?: string
}

export function HeadingBlock({ id, content, settings, sectionId }: BlockProps) {
    const s = settings as HeadingSettings || {}
    const Tag = (s.level === 'label' ? 'span' : s.level) || 'h2'

    // We will assume 'content' is the string text for now.
    // In future with Tiptap, content might be JSON.
    const textContent = typeof content === 'string' ? content : 'Heading Text'

    return (
        <Tag
            className={cn(
                "w-fit max-w-full outline-none transition-colors duration-200",
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
            onBlur={async (e) => {
                if (!sectionId) {
                    console.error("No sectionId provided to HeadingBlock")
                    return
                }
                const newText = e.currentTarget.textContent
                if (newText !== textContent) {
                    try {
                        await updateBlockContent(sectionId, id, { content: newText })
                    } catch (err) {
                        console.error("Failed to save text", err)
                    }
                }
            }}
        >
            {textContent}
        </Tag>
    )
}
