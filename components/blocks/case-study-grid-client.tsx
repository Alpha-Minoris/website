'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

import { useRef, useEffect, useCallback } from 'react'
import { EditableText } from '@/components/editor/editable-text'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { useEditorStore } from '@/lib/stores/editor-store'

type CaseStudy = {
    id: string
    title: string
    summary: string | null
    tags: string[] | null
    content_html: string | null
    layout_json: any
}

interface CaseStudyGridClientProps {
    id: string
    caseStudies: CaseStudy[]
    block?: any
    isEditMode: boolean
}

export function CaseStudyGridClient({ id, caseStudies, block, isEditMode }: CaseStudyGridClientProps) {
    const { updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLDivElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)
    const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null)
    const [open, setOpen] = useState(false)

    // Local state
    const [localBlock, setLocalBlock] = useState<any>({
        title: 'Recent Case Studies',
        tagline: 'Real results from real deployments.',
        ...block
    })


    useEffect(() => {
        if (block) {
            setLocalBlock((prev: any) => ({ ...prev, ...block }))
        }
    }, [block])

    const saveBlock = useCallback((newBlock: any) => {
        setLocalBlock(newBlock)
        updateBlock(id, newBlock)
    }, [id, updateBlock])

    const handleTextChange = (key: string, value: string) => {
        saveBlock({ ...localBlock, [key]: value })
    }

    const onTextFocus = useCallback((rect: DOMRect) => {
        if (sectionRef.current) {
            const sectionRect = sectionRef.current.getBoundingClientRect()
            const relativeLeft = rect.left - sectionRect.left + (rect.width / 2)
            const relativeTop = rect.bottom - sectionRect.top
            setActiveToolbarPos({ top: relativeTop, left: relativeLeft })
        }
    }, [])

    const onTextBlur = useCallback(() => {
        setTimeout(() => {
            const activeEl = document.activeElement
            if (!sectionRef.current?.contains(activeEl) && !activeEl?.closest('[data-radix-portal]')) {
                setActiveToolbarPos(null)
            }
        }, 150)
    }, [])

    const handleSelect = (study: CaseStudy) => {
        setSelectedStudy(study)
        setOpen(true)
    }

    return (
        <div className="container mx-auto px-4" ref={sectionRef}>
            {/* Local Toolbar */}
            {isEditMode && activeToolbarPos && (
                <div
                    className="absolute z-50 transition-all duration-100"
                    style={{ top: activeToolbarPos.top, left: activeToolbarPos.left, transform: 'translateY(-10px)' }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <TextToolbar blockId={id} />
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div className="space-y-4 max-w-2xl">
                    <EditableText
                        tagName="h2"
                        value={localBlock.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-3xl md:text-5xl font-bold font-heading"
                    />
                    <EditableText
                        tagName="p"
                        value={localBlock.tagline}
                        onChange={(v) => handleTextChange('tagline', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-muted-foreground text-lg"
                    />
                </div>
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white gap-2">
                    View All Work <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {caseStudies.map((study) => (
                    <div
                        key={study.id}
                        onClick={() => handleSelect(study)}
                        className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-accent/50 transition-all duration-300 cursor-pointer"
                    >
                        {/* Background gradient same as packages */}
                        <div className={cn(
                            "absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-700",
                            study.layout_json?.image_color || 'bg-gradient-to-br from-accent/20 to-purple-500/15'
                        )}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                        <div className="absolute inset-0 p-6 flex flex-col justify-end items-start space-y-3">
                            <div className="flex gap-2 flex-wrap">
                                {study.tags?.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <h3 className="text-xl font-bold text-white font-heading group-hover:text-accent transition-colors">
                                {study.title}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border-white/10 backdrop-blur-2xl text-foreground">
                    {selectedStudy && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-heading mb-2">{selectedStudy.title}</DialogTitle>
                                <DialogDescription className="text-lg text-muted-foreground">
                                    {selectedStudy.summary}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-6 prose prose-invert prose-lg max-w-none">
                                <ReactMarkdown>
                                    {selectedStudy.content_html || ''}
                                </ReactMarkdown>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
