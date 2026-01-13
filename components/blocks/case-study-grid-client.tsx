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

type CaseStudy = {
    id: string
    title: string
    summary: string | null
    tags: string[] | null
    content_html: string | null // We treat this as MD
    layout_json: any
}

export function CaseStudyGridClient({ caseStudies }: { caseStudies: CaseStudy[] }) {
    const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null)
    const [open, setOpen] = useState(false)

    const handleSelect = (study: CaseStudy) => {
        setSelectedStudy(study)
        setOpen(true)
    }

    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div className="space-y-4 max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading">Recent Case Studies</h2>
                    <p className="text-muted-foreground text-lg">Real results from real deployments.</p>
                </div>
                <Button variant="outline" className="rounded-full border-white/20 hover:bg-white/10 text-white gap-2">
                    View All Work <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {caseStudies.map((study) => (
                    <div
                        key={study.id}
                        onClick={() => handleSelect(study)}
                        className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5 cursor-pointer"
                    >
                        {/* Background Image Placeholder */}
                        <div className={cn(
                            "absolute inset-0 opacity-50 group-hover:scale-105 transition-transform duration-700",
                            study.layout_json?.image_color || 'bg-gray-800'
                        )}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                        <div className="absolute inset-0 p-8 flex flex-col justify-end items-start space-y-4">
                            <div className="flex gap-2 flex-wrap">
                                {study.tags?.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <h3 className="text-2xl font-bold text-white font-heading group-hover:text-accent transition-colors">
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
