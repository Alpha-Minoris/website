'use client'

import { memo, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface EditableTextProps {
    value: string
    onChange: (val: string) => void
    className?: string
    tagName?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'label'
    isEditMode: boolean
    onFocus?: (rect: DOMRect) => void
    onBlur?: () => void
    placeholder?: string
}

export const EditableText = memo(({
    value,
    onChange,
    className,
    tagName = 'div',
    isEditMode,
    onFocus,
    onBlur,
    placeholder = '...'
}: EditableTextProps) => {
    const Tag = tagName as any
    const ref = useRef<HTMLElement>(null)
    const isDirty = useRef(false)
    const lastContentHtml = useRef(value)

    // Initial Render / Remote Sync
    useEffect(() => {
        if (!isDirty.current && ref.current && ref.current.innerHTML !== value) {
            // Only update if not focused to avoid cursor reset
            if (document.activeElement !== ref.current) {
                ref.current.innerHTML = value
                lastContentHtml.current = value
            }
        }
    }, [value])

    // Use MutationObserver to detect changes from execCommand (Toolbar)
    useEffect(() => {
        if (!ref.current || !isEditMode) return

        const observer = new MutationObserver((mutations) => {
            if (!ref.current) return
            const newHtml = ref.current.innerHTML
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
            attributes: true
        })

        return () => observer.disconnect()
    }, [isEditMode, onChange])

    const handleInput = useCallback(() => {
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

    return (
        <Tag
            ref={ref}
            contentEditable={isEditMode}
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
                "outline-none transition-all duration-200",
                `empty:before:content-['${placeholder}'] empty:before:text-muted-foreground/50`,
                isEditMode ? "hover:bg-white/5 p-1 -m-1 rounded cursor-text border border-dashed border-transparent hover:border-white/20 min-w-[20px]" : "",
                className
            )}
        />
    )
}, (prev, next) => {
    return (
        prev.isEditMode === next.isEditMode &&
        prev.className === next.className &&
        prev.value === next.value &&
        prev.tagName === next.tagName &&
        prev.placeholder === next.placeholder
    )
})

EditableText.displayName = 'EditableText'
