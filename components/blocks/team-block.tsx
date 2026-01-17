
'use client'

import { BlockProps } from './types'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/stores/editor-store'
import { updateBlock as updateBlockAction } from '@/actions/block-actions'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, Twitter, Eye, EyeOff } from 'lucide-react'
import { TextToolbar } from '@/components/editor/text-toolbar'
import { EditableText } from '@/components/editor/editable-text'
import { AddButton, DeleteButton } from '@/components/editor/editable-list-controls'
import { EditableAsset } from '@/components/editor/editable-asset'

export function TeamBlock({ id, settings, sectionSlug, slug }: BlockProps) {
    const folder = sectionSlug || slug
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
    const [localSettings, setLocalSettings] = useState<any>({ ...defaultData, ...settings })
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Sync from props
    useEffect(() => {
        if (settings) {
            setLocalSettings((prev: any) => ({ ...prev, ...settings }))
        }
    }, [settings])

    const saveSettings = useCallback((newSettings: any) => {
        setLocalSettings(newSettings)
        updateBlock(id, { settings: newSettings })

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await updateBlockAction(id, newSettings)
            } catch (err) {
                console.error("Failed to save team:", err)
            }
        }, 800)
    }, [id, updateBlock])

    const handleTextChange = useCallback((key: string, value: string) => {
        saveSettings({ ...localSettings, [key]: value })
    }, [localSettings, saveSettings])

    const handleMemberChange = useCallback((index: number, key: string, value: any) => {
        const members = [...(localSettings.members || [])]
        members[index] = { ...members[index], [key]: value }
        saveSettings({ ...localSettings, members })
    }, [localSettings, saveSettings])

    const handleSocialChange = useCallback((memberIdx: number, socialIdx: number, updates: any) => {
        const members = [...(localSettings.members || [])]
        const socials = [...(members[memberIdx].socials || [])]
        socials[socialIdx] = { ...socials[socialIdx], ...updates }
        members[memberIdx] = { ...members[memberIdx], socials }
        saveSettings({ ...localSettings, members })
    }, [localSettings, saveSettings])

    const handleAddSocial = (memberIdx: number) => {
        const members = [...(localSettings.members || [])]
        const socials = [...(members[memberIdx].socials || []), {
            id: Math.random().toString(36).substr(2, 9),
            type: 'icon',
            value: 'Link',
            url: '#'
        }]
        members[memberIdx] = { ...members[memberIdx], socials }
        saveSettings({ ...localSettings, members })
    }

    const handleRemoveSocial = (memberIdx: number, socialIdx: number) => {
        const members = [...(localSettings.members || [])]
        const socials = [...(members[memberIdx].socials || [])]
        socials.splice(socialIdx, 1)
        members[memberIdx] = { ...members[memberIdx], socials }
        saveSettings({ ...localSettings, members })
    }

    const handleAddMember = () => {
        const members = [...(localSettings.members || []), {
            id: Math.random().toString(36).substr(2, 9),
            name: 'New Member',
            role: 'Expert Role',
            bio: 'Brief biography about the new member.',
            asset: { type: 'icon', value: 'user' },
            isHidden: false,
            socials: []
        }]
        saveSettings({ ...localSettings, members })
    }

    const handleRemoveMember = (index: number) => {
        const members = [...(localSettings.members || [])]
        members.splice(index, 1)
        saveSettings({ ...localSettings, members })
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

    const visibleMembersCount = localSettings.members?.filter((m: any) => !m.isHidden || isEditMode).length || 0

    return (
        <section id={id} ref={sectionRef} className="py-24 bg-black relative">
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
                <div className="text-center mb-16 relative">
                    <EditableText
                        tagName="h2"
                        value={localSettings.title}
                        onChange={(v) => handleTextChange('title', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4"
                    />
                    <EditableText
                        tagName="p"
                        value={localSettings.tagline}
                        onChange={(v) => handleTextChange('tagline', v)}
                        isEditMode={isEditMode}
                        onFocus={onTextFocus}
                        onBlur={onTextBlur}
                        className="text-muted-foreground text-lg"
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {localSettings.members?.map((member: any, i: number) => {
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
                                    />
                                    <EditableText
                                        tagName="p"
                                        value={member.role}
                                        onChange={(v) => handleMemberChange(i, 'role', v)}
                                        isEditMode={isEditMode}
                                        onFocus={onTextFocus}
                                        onBlur={onTextBlur}
                                        className="text-accent text-sm font-medium uppercase tracking-wider"
                                    />
                                    <EditableText
                                        tagName="p"
                                        value={member.bio}
                                        onChange={(v) => handleMemberChange(i, 'bio', v)}
                                        isEditMode={isEditMode}
                                        onFocus={onTextFocus}
                                        onBlur={onTextBlur}
                                        className="text-muted-foreground text-sm leading-relaxed"
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
