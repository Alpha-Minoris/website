
'use client'

import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, Twitter, Eye, EyeOff } from 'lucide-react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function TeamBlock(block: BlockProps) {
    const { id, slug } = block
    const folder = slug
    const { isEditMode, updateBlock } = useEditorStore()
    const sectionRef = useRef<HTMLElement>(null)
    const [activeToolbarPos, setActiveToolbarPos] = useState<{ top: number, left: number } | null>(null)

    // Default Data
    const defaultData = {
        title: 'Meet the Experts',
        tagline: 'The minds behind the machines.',
        members: [
            { id: '1', name: 'Sarah Chen', role: 'CTO & Co-Founder', bio: 'Ex-Google Brain. Expert in transformer architectures and agentic workflows.', asset: { type: 'icon', value: 'user' }, isHidden: false, socials: [{ id: 's1', type: 'icon', value: 'Linkedin', url: '#' }, { id: 's2', type: 'icon', value: 'Twitter', url: '#' }] },
            { id: '2', name: 'Marcus Rodriguez', role: 'Lead Architect', bio: 'Specialist in scalable systems and enterprise integration patterns.', asset: { type: 'icon', value: 'user' }, isHidden: false, socials: [{ id: 's3', type: 'icon', value: 'Linkedin', url: '#' }, { id: 's4', type: 'icon', value: 'Github', url: '#' }] },
            { id: '3', name: 'Emily Zhang', role: 'Head of Product', bio: 'Bridging the gap between technical capability and business value.', asset: { type: 'icon', value: 'user' }, isHidden: false, socials: [{ id: 's5', type: 'icon', value: 'Linkedin', url: '#' }] },
            { id: '4', name: 'David Kim', role: 'AI Ethics Lead', bio: 'Ensuring your automation is safe, compliant, and reliable.', asset: { type: 'icon', value: 'user' }, isHidden: false, socials: [{ id: 's6', type: 'icon', value: 'Twitter', url: '#' }] },
        ]
    }

    // Local state
    const [localBlock, setlocalBlock] = useState<any>({ ...defaultData, ...block })


    // Sync from props
    useEffect(() => {
        if (block) {
            setlocalBlock((prev: any) => ({ ...prev, ...block }))
        }
    }, [block])

    const saveBlock = useCallback((newblock: any) => {
        setlocalBlock(newblock)
        updateBlock(id, { block: newblock })
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        saveBlock({ ...localBlock, [key]: value })
    }, [localBlock, saveBlock])

    const handleMemberChange = useCallback((index: number, key: string, value: any) => {
        const members = [...(localBlock.members || [])]
        members[index] = { ...members[index], [key]: value }
        saveBlock({ ...localBlock, members })
    }, [localBlock, saveBlock])

    const handleSocialChange = useCallback((memberIdx: number, socialIdx: number, updates: any) => {
        const members = [...(localBlock.members || [])]
        const socials = [...(members[memberIdx].socials || [])]
        socials[socialIdx] = { ...socials[socialIdx], ...updates }
        members[memberIdx] = { ...members[memberIdx], socials }
        saveBlock({ ...localBlock, members })
    }, [localBlock, saveBlock])

    const handleAddSocial = (memberIdx: number) => {
        const members = [...(localBlock.members || [])]
        const socials = [...(members[memberIdx].socials || []), {
            id: Math.random().toString(36).substr(2, 9),
            type: 'icon',
            value: 'Link',
            url: '#'
        }]
        members[memberIdx] = { ...members[memberIdx], socials }
        saveBlock({ ...localBlock, members })
    }

    const handleRemoveSocial = (memberIdx: number, socialIdx: number) => {
        const members = [...(localBlock.members || [])]
        const socials = [...(members[memberIdx].socials || [])]
        socials.splice(socialIdx, 1)
        members[memberIdx] = { ...members[memberIdx], socials }
        saveBlock({ ...localBlock, members })
    }

    const handleAddMember = () => {
        const members = [...(localBlock.members || []), {
            id: Math.random().toString(36).substr(2, 9),
            name: 'New Member',
            role: 'Expert Role',
            bio: 'Brief biography about the new member.',
            asset: { type: 'icon', value: 'user' },
            isHidden: false,
            socials: []
        }]
        saveBlock({ ...localBlock, members })
    }

    const handleRemoveMember = (index: number) => {
        const members = [...(localBlock.members || [])]
        members.splice(index, 1)
        saveBlock({ ...localBlock, members })
    }

    const onTextFocus = useCallback((rect: DOMRect) => {
        if (sectionRef.current) {
            const sectionRect = sectionRef.current.getBoundingClientRect()
            const relativeLeft = rect.left - sectionRect.left + (rect.width / 2)
            // Position toolbar below the text block (using rect.bottom)
            const relativeTop = rect.bottom - sectionRect.top
            setActiveToolbarPos({ top: relativeTop, left: relativeLeft })
        }
    }, [])

    const onTextBlur = useCallback(() => {
        setTimeout(() => {
            const activeEl = document.activeElement
            const inPortal = activeEl?.closest('[data-radix-portal]') ||
                activeEl?.closest('[role="dialog"]') ||
                activeEl?.closest('[role="listbox"]') ||
                activeEl?.closest('[data-radix-popper-content-wrapper]')

            if (!sectionRef.current?.contains(activeEl) && !inPortal) {
                setActiveToolbarPos(null)
            }
        }, 200)
    }, [])

    const handleTeamClick = useCallback((e: React.MouseEvent) => {
        if (isEditMode) {
            if (e.target === e.currentTarget) {
                setActiveToolbarPos(null)
            }
        }
    }, [isEditMode])

    const visibleMembersCount = localBlock.members?.filter((m: any) => !m.isHidden || isEditMode).length || 0

    return (
        <section id={id} ref={sectionRef} onClickCapture={handleTeamClick} className="py-24 bg-transparent relative">
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

            <div className="container mx-auto px-4">
                <div className={cn(
                    "mb-16 relative",
                    localBlock.align === 'left' ? "text-left" :
                        localBlock.align === 'right' ? "text-right" :
                            "text-center"
                )}>
                    <EditableText
                        tagName={localBlock.level || 'h2'}
                        value={localBlock.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4"
                        style={{
                            fontFamily: localBlock.fontFamily,
                            fontSize: localBlock.fontSize,
                            color: localBlock.color
                        }}
                    />
                    <EditableText
                        tagName="p"
                        value={localBlock.tagline}
                        onChange={(v) => handleTextChange('tagline', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-muted-foreground text-lg"
                        style={{
                            fontFamily: localBlock.fontFamily,
                            fontSize: localBlock.fontSize,
                            color: localBlock.color
                        }}
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {localBlock.members?.map((member: any, i: number) => {
                        if (member.isHidden && !isEditMode) return null

                        return (
                            <Card
                                key={member.id}
                                className={cn(
                                    "w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[260px] max-w-[320px] bg-white/5 border-white/10 overflow-hidden group hover:border-accent/40 transition-colors relative",
                                    member.isHidden && "opacity-50 grayscale"
                                )}
                            >
                                {/* Admin Controls */}
                                {isEditMode && (
                                    <div className="absolute top-2 right-2 z-20 flex gap-2">
                                        <button
                                            onClick={() => handleMemberChange(i, 'isHidden', !member.isHidden)}
                                            className="p-1.5 rounded-md bg-black/50 text-white/50 hover:text-white transition-colors"
                                            title={member.isHidden ? 'Show member' : 'Hide member'}
                                        >
                                            {member.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <DeleteButton onClick={() => handleRemoveMember(i)} isEditMode={isEditMode} />
                                    </div>
                                )}

                                <div className="h-56 bg-white/5 relative group-hover:bg-white/10 transition-colors flex items-center justify-center">
                                    <EditableAsset
                                        type={member.asset?.type || 'icon'}
                                        value={member.asset?.value || 'user'}
                                        onChange={(type: 'icon' | 'image', value: string) => handleMemberChange(i, 'asset', { ...member.asset, type, value })}
                                        onUpdate={(updates: any) => handleMemberChange(i, 'asset', { ...member.asset, ...updates })}
                                        isEditMode={isEditMode}
                                        color={member.asset?.color}
                                        size={member.asset?.size}
                                        maskSettings={member.asset?.maskSettings}
                                        folder={folder}
                                        className="w-32 h-32 rounded-full"
                                        iconClassName="w-full h-full text-accent"
                                    />
                                </div>
                                <CardContent className="pt-6 text-center space-y-2">
                                    <EditableText
                                        tagName="h3"
                                        value={member.name}
                                        onChange={(v) => handleMemberChange(i, 'name', v)}
                                        isEditMode={isEditMode}
                                        onFocus={onTextFocus}
                                        onBlur={onTextBlur}
                                        className="text-xl font-bold font-heading text-white"
                                        style={{
                                            fontFamily: localBlock.fontFamily,
                                            fontSize: localBlock.fontSize,
                                            color: localBlock.color
                                        }}
                                    />
                                    <EditableText
                                        tagName="p"
                                        value={member.role}
                                        onChange={(v) => handleMemberChange(i, 'role', v)}
                                        isEditMode={isEditMode}
                                        onFocus={onTextFocus}
                                        onBlur={onTextBlur}
                                        className="text-accent text-sm font-medium uppercase tracking-wider"
                                        style={{
                                            fontFamily: localBlock.fontFamily,
                                            fontSize: localBlock.fontSize,
                                            color: localBlock.color
                                        }}
                                    />
                                    <EditableText
                                        tagName="p"
                                        value={member.bio}
                                        onChange={(v) => handleMemberChange(i, 'bio', v)}
                                        isEditMode={isEditMode}
                                        onFocus={onTextFocus}
                                        onBlur={onTextBlur}
                                        className="text-muted-foreground text-sm leading-relaxed"
                                        style={{
                                            fontFamily: localBlock.fontFamily,
                                            fontSize: localBlock.fontSize,
                                            color: localBlock.color
                                        }}
                                    />
                                </CardContent>
                                <CardFooter className="justify-center flex-wrap gap-4 pb-6 min-h-[64px]">
                                    {member.socials?.map((social: any, sIdx: number) => (
                                        <div key={social.id} className="relative group/social">
                                            <EditableAsset
                                                type={social.type || 'icon'}
                                                value={social.value}
                                                onChange={(type, value) => handleSocialChange(i, sIdx, { ...social, type, value })}
                                                onUpdate={(updates) => handleSocialChange(i, sIdx, { ...social, url: updates.linkUrl, isHidden: updates.isHidden, color: updates.color })}
                                                isEditMode={isEditMode}
                                                linkUrl={social.url}
                                                isHidden={social.isHidden}
                                                color={social.color}
                                                size={social.size}
                                                folder={folder}
                                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all shadow-lg"
                                                iconClassName="w-4 h-4"
                                            />
                                            {isEditMode && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/social:opacity-100 transition-opacity z-30">
                                                    <DeleteButton onClick={() => handleRemoveSocial(i, sIdx)} isEditMode={isEditMode} className="p-0.5 scale-75" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isEditMode && (
                                        <AddButton onClick={() => handleAddSocial(i)} isEditMode={isEditMode} className="w-8 h-8 p-1 opacity-50 hover:opacity-100" />
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}

                    {isEditMode && (
                        <div className="w-full flex justify-center mt-8">
                            <AddButton onClick={handleAddMember} isEditMode={isEditMode} title="Add Team Member" className="w-12 h-12" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}




