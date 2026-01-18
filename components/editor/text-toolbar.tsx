'use client'

import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Trash, ChevronDown, Minus, Plus, Smile, Link, Check, Unlink } from 'lucide-react'
import { IconSymbolPicker } from './icon-symbol-picker'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlockContent, deleteChildBlock } from '@/actions/block-actions'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useState, useCallback, useRef } from 'react'

import { ColorControl } from './color-control'

interface TextToolbarProps {
    blockId: string
}

interface TextToolbarUIProps {
    settings: any
    onUpdate: (updates: any) => void
    onDelete?: () => void
    formatState?: { bold: boolean, italic: boolean, isLink?: boolean }
}

export function TextToolbarUI({ settings, onUpdate, onDelete, formatState }: TextToolbarUIProps) {
    const [localFormatState, setLocalFormatState] = useState<{
        bold: boolean;
        italic: boolean;
        isLink?: boolean;
        fontSize?: string;
        fontFamily?: string;
        color?: string;
    }>(formatState || { bold: false, italic: false, isLink: false })

    // Link State
    const [linkUrl, setLinkUrl] = useState('')
    const savedRange = useRef<Range | null>(null)
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)

    // Font Size Input State
    const [fontSizeInput, setFontSizeInput] = useState('')
    const [isFontSizeEditing, setIsFontSizeEditing] = useState(false)

    const updateUIFormatState = useCallback(() => {
        if (typeof document === 'undefined') return

        const sel = window.getSelection()

        // Check for link
        let isLink = false
        let detectedFontSize: string | undefined
        let detectedFontFamily: string | undefined
        let detectedColor: string | undefined

        if (sel && sel.rangeCount > 0) {
            let node = sel.anchorNode

            // If selection is not collapsed, check all nodes in the range
            if (!sel.isCollapsed && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const container = range.commonAncestorContainer;

                // Walk through all nodes in the selection to find formatting
                const walker = document.createTreeWalker(
                    container.nodeType === Node.TEXT_NODE ? container.parentElement! : container,
                    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
                    null
                );

                let currentNode: Node | null = walker.currentNode;
                while (currentNode) {
                    if (currentNode instanceof HTMLElement) {
                        const fontSize = currentNode.style.fontSize;
                        const fontFamily = currentNode.style.fontFamily;
                        const color = currentNode.style.color;

                        if (fontSize && !detectedFontSize) {
                            detectedFontSize = fontSize;
                        }
                        if (fontFamily && !detectedFontFamily) {
                            detectedFontFamily = fontFamily;
                        }
                        if (color && !detectedColor) {
                            detectedColor = color;
                        }

                        // Check for link
                        if (currentNode.nodeName === 'A') {
                            isLink = true;
                        }

                        // Break early if we found everything
                        if (detectedFontSize && detectedFontFamily && detectedColor && isLink) break;
                    }
                    currentNode = walker.nextNode();
                }
            }

            // Fallback: Walk up the DOM tree from anchor node
            if (!detectedFontSize || !detectedFontFamily || !detectedColor || !isLink) {
                let current = node;
                while (current && current !== document.body) {
                    if (current.nodeName === 'A') {
                        isLink = true;
                    }

                    if (current instanceof HTMLElement) {
                        const fontSize = current.style.fontSize;
                        const fontFamily = current.style.fontFamily;
                        const color = current.style.color;

                        if (fontSize && !detectedFontSize) {
                            detectedFontSize = fontSize;
                        }
                        if (fontFamily && !detectedFontFamily) {
                            detectedFontFamily = fontFamily;
                        }
                        if (color && !detectedColor) {
                            detectedColor = color;
                        }
                    }

                    current = current.parentNode;
                }
            }
        }

        // Fallback to queryCommandValue if we didn't detect from inline styles
        const fallbackFontSize = document.queryCommandValue('fontSize')
        const fallbackColor = document.queryCommandValue('foreColor')

        setLocalFormatState({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            isLink,
            fontSize: detectedFontSize || (fallbackFontSize && fallbackFontSize !== '3' ? fallbackFontSize : undefined),
            fontFamily: detectedFontFamily,
            color: detectedColor || fallbackColor
        })
    }, [])

    useEffect(() => {
        if (formatState) {
            setLocalFormatState(formatState)
        } else {
            document.addEventListener('selectionchange', updateUIFormatState)
            updateUIFormatState()
            return () => document.removeEventListener('selectionchange', updateUIFormatState)
        }
    }, [formatState, updateUIFormatState])

    const handleExec = (cmd: string, val?: string) => {
        // Use CSS instead of HTML tags for formatting
        document.execCommand('styleWithCSS', false, 'true')

        if (cmd === 'fontSize' && val) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);

                // If text is selected
                if (!selection.isCollapsed) {
                    // Extract the selected content
                    const fragment = range.extractContents();

                    // Create a new span with the font size
                    const span = document.createElement('span');
                    span.style.fontSize = val;

                    // Helper function to remove existing font-size from elements
                    const removeFontSize = (node: Node) => {
                        if (node instanceof HTMLElement && node.style.fontSize) {
                            node.style.removeProperty('font-size');
                        }
                        node.childNodes.forEach(child => removeFontSize(child));
                    };

                    // Remove existing font-size styles from the fragment
                    removeFontSize(fragment);

                    // Append the cleaned fragment to the new span
                    span.appendChild(fragment);

                    // Insert the span at the selection
                    range.insertNode(span);

                    // Re-select the span's content
                    const newRange = document.createRange();
                    newRange.selectNodeContents(span);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else {
                    // No selection (cursor only) - Block level update
                    const active = document.activeElement as HTMLElement;
                    if (active && active.contentEditable === 'true') {
                        active.style.fontSize = val;
                    }
                }
            }
        } else if (cmd === 'foreColor' && val) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);

                // If text is selected
                if (!selection.isCollapsed) {
                    // Extract the selected content
                    const fragment = range.extractContents();

                    // Create a new span with the text color
                    const span = document.createElement('span');
                    span.style.color = val;

                    // Helper function to remove existing color from elements
                    const removeColor = (node: Node) => {
                        if (node instanceof HTMLElement && node.style.color) {
                            node.style.removeProperty('color');
                        }
                        node.childNodes.forEach(child => removeColor(child));
                    };

                    // Remove existing color styles from the fragment
                    removeColor(fragment);

                    // Append the cleaned fragment to the new span
                    span.appendChild(fragment);

                    // Insert the span at the selection
                    range.insertNode(span);

                    // Re-select the span's content
                    const newRange = document.createRange();
                    newRange.selectNodeContents(span);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else {
                    // No selection (cursor only) - fallback to execCommand
                    document.execCommand('foreColor', false, val);
                }
            }
        } else if (cmd === 'backColor' && val) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);

                // If text is selected
                if (!selection.isCollapsed) {
                    // First, remove background from all parent spans
                    let node = range.commonAncestorContainer;
                    while (node && node !== document.body) {
                        if (node instanceof HTMLElement && node.style.backgroundColor) {
                            node.style.removeProperty('background-color');
                        }
                        node = node.parentNode as Node;
                    }

                    // Now extract and process the fragment
                    const fragment = range.extractContents();

                    // Helper to recursively remove background from fragment
                    const removeBackgroundColor = (node: Node) => {
                        if (node instanceof HTMLElement && node.style.backgroundColor) {
                            node.style.removeProperty('background-color');
                        }
                        node.childNodes.forEach(child => removeBackgroundColor(child));
                    };

                    removeBackgroundColor(fragment);

                    // Special handling for transparent: don't wrap
                    if (val === 'transparent') {
                        range.insertNode(fragment);
                    } else {
                        const span = document.createElement('span');
                        span.style.backgroundColor = val;
                        span.appendChild(fragment);
                        range.insertNode(span);

                        // Re-select
                        const newRange = document.createRange();
                        newRange.selectNodeContents(span);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    }
                } else {
                    document.execCommand('backColor', false, val);
                }
            }
        } else {
            document.execCommand(cmd, false, val)
        }

        // Force immediate update of the UI state
        setTimeout(() => updateUIFormatState(), 0)
    }

    const saveSelection = () => {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
            savedRange.current = sel.getRangeAt(0)
        }
    }

    const restoreSelection = () => {
        const sel = window.getSelection()
        if (sel && savedRange.current) {
            sel.removeAllRanges()
            sel.addRange(savedRange.current)
        }
    }

    const handleApplyLink = () => {
        restoreSelection()
        if (linkUrl) {
            let finalUrl = linkUrl.trim()
            // Logic: If it starts with / or #, it's internal.
            // If it starts with http:// or https://, it's absolute.
            // Otherwise, assume it's external (e.g. google.com) and prepend https://
            if (!finalUrl.startsWith('/') && !finalUrl.startsWith('#') && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('mailto:')) {
                finalUrl = 'https://' + finalUrl
            }

            handleExec('createLink', finalUrl)
        }
        setIsLinkPopoverOpen(false)
        setLinkUrl('')
    }

    const handleRemoveLink = () => {
        restoreSelection()
        handleExec('unlink')
        setIsLinkPopoverOpen(false)
        setLinkUrl('')
    }

    // Detect if current selection is a link to pre-fill URL?
    // document.queryCommandValue('createLink') might return the URL? No.
    // We'd need to check anchorNode. But 'createLink' command usually doesn't need pre-fill to work.

    return (
        <Card className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 flex items-center p-2 gap-2 bg-zinc-900/80 border-white/10 backdrop-blur-2xl shadow-2xl rounded-full animate-in fade-in zoom-in-95 duration-200">

            {/* Font Family */}
            <Select
                value={(() => {
                    // Normalize the font family value
                    let font = (localFormatState as any).fontFamily || settings.fontFamily || 'Inter, sans-serif';
                    // Remove quotes if present
                    font = font.replace(/['"]/g, '');
                    return font;
                })()}
                onValueChange={(val) => {
                    const selection = window.getSelection();
                    if (selection && selection.toString().trim().length > 0) {
                        handleExec('fontName', val)
                    } else {
                        onUpdate({ fontFamily: val })
                    }
                }}
            >
                <SelectTrigger className="h-7 w-[90px] text-[10px] bg-transparent border-0 text-zinc-400 hover:text-white hover:bg-white/10 p-0 px-2 gap-1 rounded-full focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 max-h-60">
                    <SelectItem value="Inter, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer">Inter</SelectItem>
                    <SelectItem value="Space Grotesk, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-grotesk">Space Grotesk</SelectItem>
                    <SelectItem value="Arial, sans-serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-sans">Arial</SelectItem>
                    <SelectItem value="Times New Roman, serif" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-serif">Times New Roman</SelectItem>
                    <SelectItem value="Courier New, monospace" className="text-zinc-400 hover:text-white text-xs cursor-pointer font-mono">Courier New</SelectItem>
                </SelectContent>
            </Select>

            {/* Font Size - Immediate! */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const selection = window.getSelection();
                        const hasSelection = selection && selection.toString().trim().length > 0;

                        // Get current font size more reliably
                        let currentVal = settings.fontSize || '16px';
                        if (hasSelection && (localFormatState as any).fontSize) {
                            currentVal = (localFormatState as any).fontSize;
                        }

                        // Parse current value (handle both 'px' and plain numbers)
                        const currentStr = String(currentVal).replace('px', '').trim();
                        const current = parseInt(currentStr) || 16;
                        // Ensure minimum of 8px when decrementing
                        const newVal = Math.max(8, current - 1) + 'px';

                        if (hasSelection) {
                            handleExec('fontSize', newVal)
                        } else {
                            onUpdate({ fontSize: newVal })
                        }
                    }}
                >
                    <Minus className="w-3.5 h-3.5" />
                </Button>
                <input
                    type="text"
                    className={cn(
                        "w-9 h-7 bg-transparent text-xs text-center border-none focus:outline-none focus:ring-1 focus:ring-white/30 rounded transition-all",
                        isFontSizeEditing ? "text-white" : "text-zinc-400"
                    )}
                    value={isFontSizeEditing ? fontSizeInput : (() => {
                        const selection = window.getSelection();
                        const hasSelection = selection && selection.toString().trim().length > 0;

                        let currentVal = settings.fontSize || '16px';
                        if (hasSelection && (localFormatState as any).fontSize) {
                            currentVal = (localFormatState as any).fontSize;
                        }

                        const currentStr = String(currentVal).replace('px', '').trim();
                        return parseInt(currentStr) || 16;
                    })()}
                    onFocus={(e) => {
                        // Save the current selection before focusing input
                        const sel = window.getSelection();
                        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
                            savedRange.current = sel.getRangeAt(0);
                        }

                        setIsFontSizeEditing(true);
                        setFontSizeInput(e.target.value);
                        e.target.select();
                    }}
                    onChange={(e) => {
                        const val = e.target.value;
                        // Only allow digits
                        if (/^\d*$/.test(val)) {
                            setFontSizeInput(val);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const size = parseInt(fontSizeInput);
                            if (size >= 8 && size <= 200) {
                                // Restore selection if we saved one
                                if (savedRange.current) {
                                    const sel = window.getSelection();
                                    if (sel) {
                                        sel.removeAllRanges();
                                        sel.addRange(savedRange.current);
                                        handleExec('fontSize', size + 'px');
                                        savedRange.current = null;
                                    }
                                } else {
                                    onUpdate({ fontSize: size + 'px' });
                                }
                            }
                            setIsFontSizeEditing(false);
                            (e.target as HTMLInputElement).blur();
                        } else if (e.key === 'Escape') {
                            savedRange.current = null;
                            setIsFontSizeEditing(false);
                            (e.target as HTMLInputElement).blur();
                        }
                    }}
                    onBlur={() => {
                        if (isFontSizeEditing && fontSizeInput) {
                            const size = parseInt(fontSizeInput);
                            if (size >= 8 && size <= 200) {
                                // Restore selection if we saved one
                                if (savedRange.current) {
                                    const sel = window.getSelection();
                                    if (sel) {
                                        sel.removeAllRanges();
                                        sel.addRange(savedRange.current);
                                        handleExec('fontSize', size + 'px');
                                        savedRange.current = null;
                                    }
                                } else {
                                    onUpdate({ fontSize: size + 'px' });
                                }
                            }
                        }
                        setIsFontSizeEditing(false);
                    }}
                    onMouseDown={(e) => {
                        // Don't prevent default - allow focus
                        e.stopPropagation();
                    }}
                    placeholder="16"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const selection = window.getSelection();
                        const hasSelection = selection && selection.toString().trim().length > 0;

                        // Get current font size more reliably
                        let currentVal = settings.fontSize || '16px';
                        if (hasSelection && (localFormatState as any).fontSize) {
                            currentVal = (localFormatState as any).fontSize;
                        }

                        // Parse current value (handle both 'px' and plain numbers)
                        const currentStr = String(currentVal).replace('px', '').trim();
                        const current = parseInt(currentStr) || 16;
                        // Simply increment: no upper limit, but ensure never below 8px
                        const newVal = (current + 1) + 'px';

                        if (hasSelection) {
                            handleExec('fontSize', newVal)
                        } else {
                            onUpdate({ fontSize: newVal })
                        }
                    }}
                >
                    <Plus className="w-3.5 h-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Inline Formatting */}
            <div className="flex bg-white/5 rounded-full p-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { handleExec('bold') }}
                    className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", localFormatState.bold ? "text-white bg-white/20" : "text-zinc-500")}
                >
                    <Bold className="w-3.5 h-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { handleExec('italic') }}
                    className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", localFormatState.italic ? "text-white bg-white/20" : "text-zinc-500")}
                >
                    <Italic className="w-3.5 h-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Alignment */}
            <div className="flex bg-white/5 rounded-full p-0.5">
                <Button variant="ghost" size="icon" onClick={() => handleExec('justifyLeft')} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", "text-zinc-500")}>
                    <AlignLeft className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleExec('justifyCenter')} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", "text-zinc-500")}>
                    <AlignCenter className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleExec('justifyRight')} className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", "text-zinc-500")}>
                    <AlignRight className="w-3.5 h-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Link - Advanced Popover */}
            <div className="flex bg-white/5 rounded-full p-0.5">
                <Popover open={isLinkPopoverOpen} onOpenChange={(open) => {
                    setIsLinkPopoverOpen(open)
                    if (open) {
                        saveSelection()

                        // Detect existing link in selection
                        const sel = window.getSelection()
                        if (sel && sel.rangeCount > 0) {
                            let node = sel.anchorNode
                            // Check up to 3 levels up for an anchor tag
                            let foundHref = ''
                            let curr = node
                            while (curr && curr !== document.body && !foundHref) {
                                if (curr.nodeName === 'A') {
                                    foundHref = (curr as HTMLAnchorElement).getAttribute('href') || ''
                                }
                                curr = curr.parentNode
                            }
                            if (foundHref) setLinkUrl(foundHref)
                        }
                    } else {
                        // Optional: clear on close if needed, but we keep state usually?
                        // setLinkUrl('') // Better to clear on close or on apply?
                    }
                }}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onMouseDown={(e) => {
                                // Save selection before focus moves to popover
                                e.preventDefault()
                            }}
                            // Highlight if linked (state detection needed globally or on selection change, forcing generic "Active" state if URL detected in popover logic is tricky without state, but we can do it.)
                            // Actually, let's add `isLinked` state computed in `updateUIFormatState`
                            className={cn("h-7 w-7 rounded-full hover:text-white hover:bg-white/10", (isLinkPopoverOpen || (localFormatState as any).isLink) ? "text-white bg-white/20" : "text-zinc-500")}
                        >
                            {(localFormatState as any).isLink ? <Unlink className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
                        </Button>
                    </PopoverTrigger>

                    {/* Position: Bottom, Align: Center, FORCE BOTTOM even if offscreen (user request) */}
                    <PopoverContent
                        className="p-1.5 flex items-center gap-2 bg-zinc-900/80 border-white/10 backdrop-blur-2xl w-auto min-w-[320px] shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200"
                        side="bottom"
                        sideOffset={10}
                        align="center"
                        avoidCollisions={false}
                    >
                        {/* Link Input - Integrated Style */}
                        <div className="relative flex-1 group pl-2">
                            <Link className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
                            <Input
                                placeholder="Paste link..."
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="h-8 pl-6 text-xs bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-zinc-600 w-full"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleApplyLink()
                                }}
                            />
                        </div>

                        {/* Preview Thumbnail (Mini, expands on hover) */}
                        {linkUrl && (
                            <div className="relative group/preview">
                                {/* Trigger / Mini Thumb */}
                                <div className="relative w-8 h-8 shrink-0 rounded-md overflow-hidden border border-white/10 bg-black/50 cursor-help flex items-center justify-center">
                                    {/* Smart Preview Logic */}
                                    {(() => {
                                        const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#')
                                        const isLocalTarget = linkUrl.includes('localhost') || linkUrl.includes('127.0.0.1')

                                        // If internal OR targeting a local address, don't use Microlink (it can't reach them)
                                        if (isInternal || isLocalTarget) {
                                            return (
                                                <div className="text-[8px] text-zinc-400 font-mono tracking-tighter text-center leading-none px-0.5">
                                                    {isInternal ? 'INT' : 'LOC'}
                                                </div>
                                            )
                                        }

                                        return (
                                            <img
                                                src={`https://api.microlink.io?url=${encodeURIComponent(linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl)}&screenshot=true&meta=false&embed=screenshot.url`}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.innerText = '?'
                                                }}
                                                alt="Preview"
                                                className="w-full h-full object-cover opacity-70 transition-opacity"
                                            />
                                        )
                                    })()}
                                </div>

                                {/* Expanded Hover Card */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[480px] aspect-video bg-zinc-950 border border-white/10 shadow-2xl rounded-lg overflow-hidden opacity-0 invisible group-hover/preview:opacity-100 group-hover/preview:visible transition-all duration-200 z-50 pointer-events-none origin-bottom scale-95 group-hover/preview:scale-100">

                                    {(() => {
                                        const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#')
                                        const isLocalTarget = linkUrl.includes('localhost') || linkUrl.includes('127.0.0.1')

                                        if (isInternal || isLocalTarget) {
                                            // Internal Link / Localhost Preview Placeholder
                                            return (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/90 p-6 space-y-2">
                                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                                                        {linkUrl.startsWith('#') ? <span className="text-xl text-zinc-400">#</span> : <Link className="w-6 h-6 text-zinc-400" />}
                                                    </div>
                                                    <p className="text-sm font-medium text-white">{isInternal ? 'Internal Link' : 'Local Target'}</p>
                                                    <p className="text-xs text-zinc-500 font-mono bg-black/50 px-2 py-1 rounded">{linkUrl}</p>
                                                    <p className="text-[10px] text-zinc-600 mt-4 max-w-[200px] text-center">
                                                        Preview unavailable for internal routes or local development targets.
                                                    </p>
                                                </div>
                                            )
                                        }

                                        // External Link (Production or Public)
                                        const targetUrl = linkUrl.startsWith('http') ? linkUrl : 'https://' + linkUrl

                                        return (
                                            <>
                                                <div className="absolute inset-0 bg-zinc-900/50 animate-pulse" />
                                                <img
                                                    src={`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&embed=screenshot.url`}
                                                    alt="Large Preview"
                                                    className="relative z-10 w-full h-full object-cover"
                                                />
                                            </>
                                        )
                                    })()}

                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent z-20">
                                        <p className="text-[10px] text-zinc-300 truncate font-mono">{linkUrl}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Separator orientation="vertical" className="h-5 bg-white/10" />

                        {/* Action Icons */}
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveLink}
                                className="h-7 w-7 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleApplyLink}
                                className="h-7 w-7 rounded-full text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Separator orientation="vertical" className="h-4 bg-white/10" />

            {/* Colors using ColorControl */}
            <div className="flex items-center gap-1.5 px-1">
                <ColorControl
                    label="Text Color"
                    value={settings.color}
                    isExecCommand={true}
                    defaultHex="#000000"
                    onChange={(v) => {
                        const selection = window.getSelection();
                        if (selection && selection.toString().trim().length > 0) {
                            handleExec('foreColor', v)
                        } else {
                            onUpdate({ color: v })
                        }
                    }}
                />

                <ColorControl
                    label="Background"
                    value={settings.backgroundColor}
                    defaultHex="transparent"
                    onChange={(v) => {
                        const selection = window.getSelection();
                        if (selection && selection.toString().trim().length > 0) {
                            handleExec('backColor', v)
                        } else {
                            onUpdate({ backgroundColor: v })
                        }
                    }}
                />
            </div>

            {
                onDelete && (
                    <>
                        <Separator orientation="vertical" className="h-4 bg-white/10 mx-1" />
                        <Button variant="ghost" size="icon" onClick={onDelete} className="h-7 w-7 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <Trash className="w-3.5 h-3.5" />
                        </Button>
                    </>
                )
            }

            <Separator orientation="vertical" className="h-4 bg-white/10 mx-1" />

            {/* Icon/Symbol Picker */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-zinc-400 hover:text-white hover:bg-white/10">
                        <Smile className="w-3.5 h-3.5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-zinc-950 border-zinc-800 w-auto" side="top" sideOffset={10}>
                    <IconSymbolPicker
                        onInsertSymbol={(char) => {
                            // Restore focus logic might be needed if popover stole it, 
                            // but usually popover keeps focus context or we handle it.
                            handleExec('insertText', char)
                        }}
                        onInsertIcon={async (iconName) => {
                            // Fetch SVG string
                            // Since we are client side, we can't easily use renderToStaticMarkup of a lazy component synchronously.
                            // But we can fetch the icon source or use a simple SVG placeholder 
                            // OR better: construct a standard feather/lucide SVG string manually if we have the path data.
                            // Wait, lucide-react lazy imports return modules. 

                            // Easier approach: Use an image tag with a data URI? No, inline SVG is better.
                            // Let's try to fetch the SVG from an API or just use a generic method?
                            // Actually, dynamicIconImports contains the module.

                            try {
                                // Fetch the SVG from unpkg (lucide-static)
                                const res = await fetch(`https://unpkg.com/lucide-static@latest/icons/${iconName}.svg`)
                                if (res.ok) {
                                    const svgText = await res.text()
                                    // Clean up SVG size to be 1em inline
                                    const inlineSvg = svgText.replace('<svg', '<svg style="display:inline; height:1em; width:1em; vertical-align:-0.125em;"')
                                    handleExec('insertHTML', inlineSvg + '&nbsp;')
                                }
                            } catch (e) {
                                console.error(e)
                            }
                        }}
                    />
                </PopoverContent>
            </Popover>
        </Card >
    )
}

interface TextToolbarProps {
    blockId: string
}

export function TextToolbar({ blockId }: TextToolbarProps) {
    const { blocks, removeBlock, setSelectedBlockId, updateBlock: updateStoreBlock } = useEditorStore()

    // --- HELPERS PRESERVED ---
    const findParentSectionId = useCallback((childId: string): string | null => {
        const findSection = (blocks: any[], parentSectionId?: string): string | null => {
            for (const block of blocks) {
                if (block.id === childId) return block.id
                if (block.content && Array.isArray(block.content)) {
                    const currentSectionId = parentSectionId || block.id
                    if (block.content.some((c: any) => c.id === childId)) return currentSectionId
                    const found = findSection(block.content, currentSectionId)
                    if (found) return found
                }
                if (block.settings?.backContent && Array.isArray(block.settings.backContent)) {
                    const currentSectionId = parentSectionId || block.id
                    if (block.settings.backContent.some((c: any) => c.id === childId)) return currentSectionId
                    const found = findSection(block.settings.backContent, currentSectionId)
                    if (found) return found
                }
            }
            return null
        }
        return findSection(blocks)
    }, [blocks])

    const findBlock = useCallback((id: string, list: any[]): any => {
        for (const block of list) {
            if (block.id === id) return block
            if (block.content && Array.isArray(block.content)) {
                const found = findBlock(id, block.content)
                if (found) return found
            }
        }
        return null
    }, [])
    // -------------------------

    const block = findBlock(blockId, blocks)

    // Local state
    const [localSettings, setLocalSettings] = useState(block?.settings || {})
    const prevSettingsRef = useRef(block?.settings)

    // Sync external changes to local state
    useEffect(() => {
        if (JSON.stringify(block?.settings) !== JSON.stringify(prevSettingsRef.current)) {
            setLocalSettings(block?.settings || {})
            prevSettingsRef.current = block?.settings
        }
    }, [block?.settings])

    // Save timeout ref
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Optimistic Update wrapper
    const handleUpdate = (updates: any) => {
        // 1. Update State
        const newSettings = { ...localSettings, ...updates }
        setLocalSettings(newSettings)

        // 2. Update Store Immediately (Snappy UI)
        updateStoreBlock(blockId, { settings: newSettings })

        // 3. Queue Server Save (Debounced)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(async () => {
            const sectionId = findParentSectionId(blockId)

            // If we can't find a parent section (and it's not in the tree as a child),
            // it might BE the section itself (like Footer).
            // findParentSectionId returns the ID of the section containing the block.
            // If blockId IS the section, it returns the section ID (itself) if implemented deeply, 
            // but the current implementation of findParentSectionId might return itself?
            // Let's check findParentSectionId implementation lines 294-314 in view_file 883.
            // It iterates `blocks`. If `block.id === childId` returns `block.id`.
            // So yes, if Footer is root, sectionId === blockId.

            if (!sectionId) return

            try {
                if (sectionId === blockId) {
                    // It is a root section. Use updateBlock (Section Level)
                    // Dynamic import to avoid cycles if needed, or stick to what we have.
                    // block-actions exports updateBlock.
                    const { updateBlock } = await import('@/actions/block-actions')
                    await updateBlock(blockId, newSettings)
                } else {
                    // It is a child. Use updateBlockContent.
                    await updateBlockContent(sectionId, blockId, { settings: newSettings })
                }
            } catch (err) {
                console.error("Failed to save text settings", err)
            }
        }, 500)
    }

    // Handlers
    const handleDelete = async () => {
        const sectionId = findParentSectionId(blockId)
        if (sectionId) {
            try {
                await deleteChildBlock(sectionId, blockId)
                setSelectedBlockId(null)
            } catch (err) {
                console.error("Failed to delete", err)
            }
        }
    }

    if (!block) return null

    return (
        <TextToolbarUI
            settings={localSettings}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
        />
    )
}
