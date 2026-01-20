'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, Star, Plus, X } from 'lucide-react'
import { EditableText } from '@/components/editor/editable-text'
import { EditableAsset } from '@/components/editor/editable-asset'

type ServiceCardProps = {
    title: string
    desc: string
    details: string[]
    asset: { type: 'icon' | 'image', value: string, color?: string, size?: number, maskSettings?: any }
    isEditMode: boolean
    onUpdate: (data: any) => void
    onTextFocus: (rect: DOMRect) => void
    onTextBlur: () => void
    folder?: string
}

export function ServiceFlipCard({ title, desc, details, asset, isEditMode, onUpdate, onTextFocus, onTextBlur, folder }: ServiceCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    const handleFlip = () => {
        if (!isAnimating) {
            setIsFlipped(!isFlipped)
            setIsAnimating(true)
        }
    }

    const handleDetailChange = (index: number, value: string) => {
        const newDetails = [...details]
        newDetails[index] = value
        onUpdate({ details: newDetails })
    }

    const handleAddDetail = () => {
        onUpdate({ details: [...details, "New Detail"] })
    }

    const handleRemoveDetail = (index: number) => {
        onUpdate({ details: details.filter((_, i) => i !== index) })
    }

    return (
        <div className="h-[520px] w-full perspective-1000 group">
            <motion.div
                className="relative w-full h-full transition-all duration-500 transform-style-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                onAnimationComplete={() => setIsAnimating(false)}
            >
                {/* FRONT FACE */}
                <Card className="absolute inset-0 w-full h-full backface-hidden bg-white/5 border-white/10 overflow-hidden group hover:border-accent/40 transition-colors flex flex-col justify-between">
                    <div className="h-56 bg-white/5 relative group-hover:bg-white/10 transition-colors flex items-center justify-center border-b border-white/5">
                        <EditableAsset
                            type={asset?.type || 'icon'}
                            value={asset?.value || 'bot'}
                            onChange={(type, value) => onUpdate({ asset: { ...asset, type, value } })}
                            onUpdate={(updates) => onUpdate({ asset: { ...asset, ...updates } })}
                            isEditMode={isEditMode}
                            color={asset?.color}
                            size={asset?.size}
                            maskSettings={asset?.maskSettings}
                            folder={folder}
                            className="w-32 h-32 rounded-3xl"
                        />
                    </div>

                    <CardContent className="flex-1 pt-8 text-center space-y-3 px-6">
                        <EditableText
                            tagName="h3"
                            value={title}
                            onChange={(v) => onUpdate({ title: v })}
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            className="font-heading text-2xl text-white group-hover:text-accent transition-colors"
                        />
                        <EditableText
                            tagName="p"
                            value={desc}
                            onChange={(v) => onUpdate({ desc: v })}
                            isEditMode={isEditMode}
                            onFocus={onTextFocus}
                            onBlur={onTextBlur}
                            className="text-muted-foreground text-sm leading-relaxed line-clamp-4"
                        />
                    </CardContent>

                    <div className="pb-8 text-center">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-accent text-xs uppercase tracking-widest font-bold hover:text-white transition-colors"
                            onClick={handleFlip}
                        >
                            View Details
                        </Button>
                    </div>
                </Card>

                {/* BACK FACE */}
                <Card className="absolute inset-0 w-full h-full backface-hidden bg-zinc-950 border-accent/40 flex flex-col rotate-y-180 overflow-hidden">
                    <CardContent className="flex flex-col h-full pt-8 justify-center">
                        <div className="space-y-4">
                            <h4 className="font-bold text-white mb-4 uppercase tracking-tighter flex items-center gap-2">
                                <Star className="w-4 h-4 text-accent" />
                                Key Features
                            </h4>
                            <ul className="space-y-4">
                                {details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-white/80 group/feat relative">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                        <EditableText
                                            value={detail}
                                            onChange={(v) => handleDetailChange(i, v)}
                                            isEditMode={isEditMode}
                                            onFocus={onTextFocus}
                                            onBlur={onTextBlur}
                                            className="w-full pr-6 ml-1"
                                        />
                                        {isEditMode && (
                                            <button
                                                onClick={() => handleRemoveDetail(i)}
                                                className="absolute -right-2 top-0 text-white/20 hover:text-red-500 opacity-0 group-hover/feat:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                                {isEditMode && (
                                    <button
                                        onClick={handleAddDetail}
                                        className="flex items-center gap-2 text-xs text-accent/50 hover:text-accent transition-colors pt-2"
                                    >
                                        <Plus className="w-3 h-3" /> Add Detail
                                    </button>
                                )}
                            </ul>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="self-start mt-6 text-white hover:bg-white/10 gap-2 font-bold uppercase tracking-widest text-[10px]"
                            onClick={handleFlip}
                        >
                            <ArrowLeft className="w-3 h-3" /> Go Back
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
