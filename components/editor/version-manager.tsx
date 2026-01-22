'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    History,
    Save,
    Trash2,
    RotateCcw,
    Eye,
    X,
    Database,
    Package,
    ChevronRight,
    Search,
    Download,
    Layers,
    Clock,
    CheckCircle2,
    AlertCircle,
    Lock,
    FileJson,
    FileText,
    Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    listAllVersions,
    listBackups,
    createPageBackup,
    deleteVersion,
    deleteBackup,
    revertToVersion,
    restoreFromBackup,
    importBackupFromJson
} from '@/actions/version-actions'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useEditorStore } from '@/lib/stores/editor-store'
import { cn } from '@/lib/utils'
import { stripHtmlTags } from '@/lib/utils/html'

// Helper for native relative time
function formatRelativeTime(date: Date) {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
}

// Calculate approximate size of version data in bytes
function calculateVersionSize(version: any): number {
    const layoutJson = version.layout_json ? JSON.stringify(version.layout_json) : '{}'
    const contentHtml = version.content_html ? JSON.stringify(version.content_html) : '[]'
    return new Blob([layoutJson, contentHtml]).size
}

// Format bytes to human-readable size
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Download backup as JSON file
function downloadBackupAsJson(backup: any) {
    const jsonString = JSON.stringify(backup.snapshot_json, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_${backup.name.replace(/[^a-z0-9]/gi, '_')}_${new Date(backup.created_at).toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// Convert backup to Markdown format
function convertBackupToMarkdown(backup: any): string {
    const sections = backup.snapshot_json as any[]
    const lines: string[] = [
        `# Website Backup: ${backup.name}`,
        ``,
        `**Created:** ${new Date(backup.created_at).toLocaleString()}`,
        `**Type:** ${backup.backup_type}`,
        `**Sections:** ${sections.length}`,
        ``,
        `---`,
        ``
    ]

    sections.forEach((section, index) => {
        lines.push(`## ${index + 1}. ${section.title || 'Untitled Section'}`)
        lines.push(``)

        // Published version
        if (section.published_layout_json) {
            lines.push(`### Published Version`)
            lines.push(``)
            const layout = section.published_layout_json
            if (layout.title) lines.push(`**Title:** ${layout.title}`)
            if (layout.subtitle) lines.push(`**Subtitle:** ${layout.subtitle}`)
            if (layout.description) lines.push(`**Description:** ${layout.description}`)

            // Handle items/features/services arrays
            const itemArrays = ['items', 'features', 'services', 'packages', 'members', 'steps', 'testimonials']
            itemArrays.forEach(key => {
                if (Array.isArray(layout[key]) && layout[key].length > 0) {
                    lines.push(``)
                    lines.push(`**${key.charAt(0).toUpperCase() + key.slice(1)}:**`)
                    layout[key].forEach((item: any, i: number) => {
                        const itemTitle = item.title || item.name || item.question || `Item ${i + 1}`
                        const itemDesc = item.description || item.answer || item.content || ''
                        lines.push(`- **${itemTitle}**${itemDesc ? `: ${itemDesc.substring(0, 200)}${itemDesc.length > 200 ? '...' : ''}` : ''}`)
                    })
                }
            })
            lines.push(``)
        }

        // Draft version
        if (section.draft_layout_json) {
            lines.push(`### Draft Version`)
            lines.push(``)
            const layout = section.draft_layout_json
            if (layout.title) lines.push(`**Title:** ${layout.title}`)
            if (layout.subtitle) lines.push(`**Subtitle:** ${layout.subtitle}`)
            if (layout.description) lines.push(`**Description:** ${layout.description}`)

            const itemArrays = ['items', 'features', 'services', 'packages', 'members', 'steps', 'testimonials']
            itemArrays.forEach(key => {
                if (Array.isArray(layout[key]) && layout[key].length > 0) {
                    lines.push(``)
                    lines.push(`**${key.charAt(0).toUpperCase() + key.slice(1)}:**`)
                    layout[key].forEach((item: any, i: number) => {
                        const itemTitle = item.title || item.name || item.question || `Item ${i + 1}`
                        const itemDesc = item.description || item.answer || item.content || ''
                        lines.push(`- **${itemTitle}**${itemDesc ? `: ${itemDesc.substring(0, 200)}${itemDesc.length > 200 ? '...' : ''}` : ''}`)
                    })
                }
            })
            lines.push(``)
        }

        lines.push(`---`)
        lines.push(``)
    })

    return lines.join('\n')
}

// Download backup as Markdown file
function downloadBackupAsMarkdown(backup: any) {
    const markdown = convertBackupToMarkdown(backup)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_${backup.name.replace(/[^a-z0-9]/gi, '_')}_${new Date(backup.created_at).toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

interface VersionManagerProps {
    isOpen: boolean
    onClose: () => void
}

export function VersionManager({ isOpen, onClose }: VersionManagerProps) {
    const { blocks, selectedBlockId } = useEditorStore()
    const [activeTab, setActiveTab] = useState('history')
    const [focusSectionId, setFocusSectionId] = useState<string | null>(selectedBlockId)
    const [versions, setVersions] = useState<any[]>([])
    const [backups, setBackups] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [allVersionsMap, setAllVersionsMap] = useState<Map<string, any[]>>(new Map())
    const [backupName, setBackupName] = useState('')

    // Backup source type: 'published' or 'draft' (not both)
    const [backupSourceType, setBackupSourceType] = useState<'published' | 'draft'>('published')

    // File input ref for JSON import
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Restore Options State
    const [restoreModalOpen, setRestoreModalOpen] = useState(false)
    const [restoreOptions, setRestoreOptions] = useState<{
        backupId: string
        restorePublished: boolean
        restoreDraft: boolean
    } | null>(null)

    // Confirmation Modal State
    const [confOpen, setConfOpen] = useState(false)
    const [confAction, setConfAction] = useState<{
        type: 'revert' | 'restore' | 'delete-v' | 'delete-b' | 'info' | 'error',
        id?: string,
        title: string,
        desc: string,
        onConfirm?: () => void
    } | null>(null)

    // Sync focusSectionId with selectedBlockId when modal opens if not set
    useEffect(() => {
        if (isOpen && !focusSectionId && selectedBlockId) {
            setFocusSectionId(selectedBlockId)
        } else if (isOpen && !focusSectionId && blocks.length > 0) {
            // Default to first section if nothing selected
            setFocusSectionId(blocks[0].id)
        }
    }, [isOpen, selectedBlockId, blocks])

    // Load Data
    const refreshData = useCallback(async () => {
        setLoading(true)
        try {
            if (activeTab === 'history' && focusSectionId) {
                const data = await listAllVersions(focusSectionId)
                setVersions(data)
            } else if (activeTab === 'backups') {
                const data = await listBackups()
                setBackups(data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [activeTab, focusSectionId])

    // Load all versions for total calculation
    useEffect(() => {
        if (isOpen && activeTab === 'history') {
            const loadAllVersions = async () => {
                const versionMap = new Map<string, any[]>()
                for (const block of blocks) {
                    try {
                        const data = await listAllVersions(block.id)
                        versionMap.set(block.id, data)
                    } catch (err) {
                        console.error(`Failed to load versions for ${block.id}`, err)
                    }
                }
                setAllVersionsMap(versionMap)
            }
            loadAllVersions()
        }
    }, [isOpen, activeTab, blocks])

    useEffect(() => {
        if (isOpen) {
            refreshData()
        }
    }, [isOpen, refreshData])

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    const handleCreateBackup = async () => {
        if (!backupName.trim()) return
        setLoading(true)
        try {
            // Convert sourceType to options format expected by createPageBackup
            const options = {
                includePublished: backupSourceType === 'published',
                includeDraft: backupSourceType === 'draft'
            }
            await createPageBackup(backupName, options)
            setBackupName('')
            setBackupSourceType('published')
            await refreshData()

            triggerConfirm('info', '', 'Backup Created', 'The global snapshot has been captured successfully.')
        } catch (err) {
            console.error(err)
            triggerConfirm('error', '', 'Backup Failed', err instanceof Error ? err.message : 'Failed to create backup')
        } finally {
            setLoading(false)
        }
    }

    const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setLoading(true)
        try {
            const text = await file.text()
            const json = JSON.parse(text)

            // Auto-generate name based on file name if no prompt is available that fits the UI
            const name = file.name.replace('.json', '')

            await importBackupFromJson(name, json, backupSourceType)
            await refreshData()
            triggerConfirm('info', '', 'Backup Imported', `Successfully imported "${name}" as a new snapshot.`)
        } catch (err) {
            console.error(err)
            triggerConfirm('error', '', 'Import Failed', err instanceof Error ? err.message : 'Failed to import backup')
        } finally {
            setLoading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const triggerConfirm = (type: any, id: string, title: string, desc: string, onConfirm?: () => void) => {
        setConfAction({ type, id, title, desc, onConfirm })
        setConfOpen(true)
    }

    const handleConfirmedAction = async () => {
        if (!confAction) return

        // If it's just an info/error modal, just close it
        if (confAction.type === 'info' || confAction.type === 'error') {
            setConfOpen(false)
            return
        }

        setLoading(true)
        try {
            switch (confAction.type) {
                case 'revert':
                    await revertToVersion(confAction.id!)
                    window.location.reload()
                    break
                case 'restore':
                    // Should not reach here - restore now uses modal
                    break
                case 'delete-v':
                    await deleteVersion(confAction.id!)
                    await refreshData()
                    break
                case 'delete-b':
                    await deleteBackup(confAction.id!)
                    await refreshData()
                    break
            }
        } catch (err) {
            triggerConfirm('error', '', 'Action Failed', err instanceof Error ? err.message : "Action failed")
        } finally {
            setLoading(false)
            setConfOpen(false)
        }
    }

    const handleRestore = async () => {
        if (!restoreOptions) return
        setLoading(true)
        try {
            // Always restores as draft for safety - user can publish if satisfied
            await restoreFromBackup(restoreOptions.backupId)
            setRestoreModalOpen(false)
            setRestoreOptions(null)

            triggerConfirm('info', '', 'Restoration Complete', 'All sections have been restored as DRAFT versions. Page will now refresh.', () => {
                window.location.reload()
            })

            // Short delay to let user see the message before reload if they just click ok
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        } catch (err) {
            triggerConfirm('error', '', 'Restore Failed', err instanceof Error ? err.message : "Restore failed")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-[1800px] h-[85vh] flex flex-col overflow-hidden border border-white/20 bg-zinc-900/95 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl rounded-3xl ring-1 ring-white/10"
            >
                {/* Multi-Pane Body wrapped in Tabs Context */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-2xl shadow-inner ring-1 ring-blue-500/30">
                                <History className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Version Control</h2>
                                <p className="text-sm text-zinc-400 font-medium">History, Snapshots & Rollbacks</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
                                <TabsList className="bg-transparent border-0 p-0 h-10">
                                    <TabsTrigger
                                        value="history"
                                        className="rounded-xl px-4 h-8 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                                    >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Section History
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="backups"
                                        className="rounded-xl px-4 h-8 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                                    >
                                        <Package className="w-4 h-4 mr-2" />
                                        Full Backups
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="h-8 w-px bg-white/10 mx-2" />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-10 w-10 hover:bg-white/10 rounded-full transition-all group"
                            >
                                <X className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                            </Button>
                        </div>
                    </div>

                    {/* Multi-Pane Body */}
                    <div className="flex-1 flex overflow-hidden">

                        {/* Sidebar: Section List (Only for history tab) */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'history' && (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="w-60 border-r border-white/10 bg-black/20 flex flex-col shrink-0"
                                >
                                    <div className="p-4 border-b border-white/5 bg-white/5">
                                        <div className="flex items-center gap-2 px-2">
                                            <Layers className="w-4 h-4 text-zinc-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Page Sections</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                        {blocks.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setFocusSectionId(section.id)}
                                                className={cn(
                                                    "w-full flex items-center text-left p-3 rounded-2xl transition-all group relative overflow-hidden",
                                                    focusSectionId === section.id
                                                        ? "bg-blue-500/20 text-blue-100 ring-1 ring-blue-500/30 shadow-lg"
                                                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                {focusSectionId === section.id && (
                                                    <motion.div layoutId="active-section" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-full" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate leading-tight">
                                                        {section.displayTitle || section.slug?.replace(/-/g, ' ') || 'Untitled'}
                                                    </p>
                                                    <p className="text-[9px] text-zinc-500 font-mono mt-0.5 opacity-60">
                                                        ID: {section.id.slice(0, 8)}
                                                    </p>
                                                </div>
                                                <ChevronRight className={cn("w-4 h-4 transition-transform", focusSectionId === section.id ? "rotate-90 text-blue-400" : "opacity-0 group-hover:opacity-100")} />
                                            </button>
                                        ))}
                                        {blocks.length === 0 && (
                                            <div className="py-20 text-center space-y-2 opacity-50">
                                                <Database className="w-8 h-8 mx-auto" />
                                                <p className="text-[10px] uppercase font-bold tracking-wider">No sections found</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Content Pane */}
                        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
                            {activeTab === 'history' && (
                                <TabsContent value="history" className="flex-1 flex flex-col min-h-0 m-0 focus-visible:ring-0">
                                    {focusSectionId ? (
                                        <div className="flex-1 flex flex-col p-8 md:p-10 gap-6 overflow-hidden">
                                            {/* Action Bar */}
                                            <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white leading-none">
                                                        {blocks.find(b => b.id === focusSectionId)?.displayTitle || blocks.find(b => b.id === focusSectionId)?.slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Section History"}
                                                    </h3>
                                                    <p className="text-[10px] text-zinc-500 tracking-wider font-mono mt-1">
                                                        {versions.length} version{versions.length !== 1 ? 's' : ''} ·
                                                        <span className="text-blue-400 ml-1">
                                                            {formatBytes(versions.reduce((sum, v) => sum + calculateVersionSize(v), 0))}
                                                        </span>
                                                        <span className="text-zinc-600 mx-2">/</span>
                                                        <span className="text-zinc-500">Total: </span>
                                                        <span className="text-emerald-400">
                                                            {formatBytes(
                                                                Array.from(allVersionsMap.values())
                                                                    .flat()
                                                                    .reduce((sum, v) => sum + calculateVersionSize(v), 0)
                                                            )}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={refreshData}
                                                        disabled={loading}
                                                        className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl"
                                                    >
                                                        <RotateCcw className={cn("w-3.5 h-3.5 mr-2", loading && "animate-spin")} />
                                                        Sync
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Versions Grid/Table */}
                                            <div className="flex-1 overflow-auto rounded-[2rem] border border-white/10 bg-black/40 shadow-inner group/list custom-scrollbar">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-md z-20">
                                                        <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest font-black text-zinc-500">
                                                            <th className="px-8 py-4">State</th>
                                                            <th className="px-8 py-4">Modification Date</th>
                                                            <th className="px-8 py-4">Size</th>
                                                            <th className="px-8 py-4 text-right">Operations</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {versions.map((v) => {
                                                            const isLive = v.status === 'published'
                                                            const isDraft = v.status === 'draft'
                                                            return (
                                                                <tr key={v.id} className="group hover:bg-white/[0.03] transition-colors relative">
                                                                    <td className="px-8 py-5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={cn(
                                                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ring-1",
                                                                                isLive ? "bg-green-500/20 text-green-400 ring-green-500/30" :
                                                                                    isDraft ? "bg-yellow-500/20 text-yellow-400 ring-yellow-500/30" :
                                                                                        "bg-zinc-500/10 text-zinc-500 ring-white/5"
                                                                            )}>
                                                                                {v.status}
                                                                            </span>
                                                                            {isLive && (
                                                                                <span className="text-[10px] text-green-500 font-bold ml-2 flex items-center gap-1">
                                                                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                                                    (Live on Production)
                                                                                </span>
                                                                            )}
                                                                            {isDraft && (
                                                                                <span className="text-[10px] text-yellow-500 font-bold ml-2 flex items-center gap-1">
                                                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                                                    (Active in Staging)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-5">
                                                                        <div className="flex flex-col">
                                                                            <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                                                                                {formatRelativeTime(new Date(v.created_at))}
                                                                            </div>
                                                                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                                                                {new Date(v.created_at).toLocaleString('en-US', {
                                                                                    weekday: 'short',
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    hour: 'numeric',
                                                                                    minute: 'numeric',
                                                                                    second: 'numeric'
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-5">
                                                                        <div className="text-xs font-mono text-zinc-400">
                                                                            {formatBytes(calculateVersionSize(v))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-5 text-right">
                                                                        <div className="flex items-center justify-end gap-2 translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-9 w-9 bg-white/5 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all"
                                                                                title="Preview this state"
                                                                                onClick={() => window.open(`/view?preview=${v.id}`, '_blank')}
                                                                            >
                                                                                <Eye className="w-4 h-4" />
                                                                            </Button>

                                                                            {!isLive && !isDraft && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-9 w-9 bg-white/5 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                                                                                    title="Rollback to this version"
                                                                                    onClick={() => triggerConfirm(
                                                                                        'revert',
                                                                                        v.id,
                                                                                        'Rollback Section?',
                                                                                        'This will clone this historical state and set it as the new Live version. Your current Live content will be archived.'
                                                                                    )}
                                                                                >
                                                                                    <RotateCcw className="w-4 h-4" />
                                                                                </Button>
                                                                            )}

                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                disabled={isLive || isDraft}
                                                                                className={cn(
                                                                                    "h-9 w-9 bg-white/5 rounded-xl transition-all",
                                                                                    (isLive || isDraft)
                                                                                        ? "text-zinc-500 cursor-not-allowed border border-white/5"
                                                                                        : "hover:bg-red-500/20 text-red-400"
                                                                                )}
                                                                                title={isLive ? "Cannot delete production state" : isDraft ? "Cannot delete staging state" : "Permanently remove"}
                                                                                onClick={() => triggerConfirm(
                                                                                    'delete-v',
                                                                                    v.id,
                                                                                    'Purge Version?',
                                                                                    'This action is irreversible. All data for this specific historical record will be destroyed.'
                                                                                )}
                                                                            >
                                                                                {(isLive || isDraft) ? <Lock className="w-3.5 h-3.5" /> : <Trash2 className="w-4 h-4" />}
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                                {versions.length === 0 && !loading && (
                                                    <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-4">
                                                        <History className="w-16 h-16 opacity-5 opacity-pulse" />
                                                        <p className="text-sm font-medium">No historical timeline available</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center p-12 text-zinc-500 gap-6">
                                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10 shadow-2xl">
                                                <Layers className="w-10 h-10 opacity-20" />
                                            </div>
                                            <div className="text-center max-w-xs">
                                                <p className="text-lg font-bold text-white mb-2">Select a Context</p>
                                                <p className="text-xs leading-relaxed">Choose a section from the sidebar to inspect its evolution and rollback points.</p>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            )}

                            {activeTab === 'backups' && (
                                <TabsContent value="backups" className="flex-1 overflow-y-auto m-0 p-8 md:px-12 focus-visible:ring-0 custom-scrollbar">
                                    <div className="flex flex-col gap-8">
                                        {/* Backup Header */}
                                        <div className="flex items-center justify-between p-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/10 to-transparent shadow-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-indigo-500/20 rounded-2xl shadow-inner ring-1 ring-indigo-500/30">
                                                    <Database className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white leading-none">Global Snapshots</h3>
                                                    <p className="text-xs text-zinc-500 mt-2">Capture the state of all sections in a single point in time</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                {/* Source Type Toggle */}
                                                <div className="flex items-center gap-4 bg-black/40 p-3 rounded-2xl ring-1 ring-white/10">
                                                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Source:</span>
                                                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
                                                        <button
                                                            type="button"
                                                            onClick={() => setBackupSourceType('published')}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                                backupSourceType === 'published'
                                                                    ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/30"
                                                                    : "text-zinc-500 hover:text-white"
                                                            )}
                                                        >
                                                            Published
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setBackupSourceType('draft')}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                                backupSourceType === 'draft'
                                                                    ? "bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30"
                                                                    : "text-zinc-500 hover:text-white"
                                                            )}
                                                        >
                                                            Draft
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Backup Name Input and Buttons */}
                                                <div className="flex items-center gap-3 bg-black/40 p-2 pl-4 rounded-full ring-1 ring-white/10 focus-within:ring-blue-500/50 transition-all">
                                                    <Input
                                                        placeholder="Label this snapshot..."
                                                        className="h-8 w-48 bg-transparent border-0 text-sm focus-visible:ring-0 placeholder:text-zinc-600 font-medium"
                                                        value={backupName}
                                                        onChange={(e) => setBackupName(e.target.value)}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={handleCreateBackup}
                                                        disabled={loading || !backupName.trim()}
                                                        className="h-8 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full shadow-lg transition-all disabled:opacity-30"
                                                    >
                                                        <Download className="w-3.5 h-3.5 mr-2" />
                                                        Snapshot
                                                    </Button>

                                                    {/* JSON Import Button */}
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept=".json"
                                                        className="hidden"
                                                        onChange={handleImportJson}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={loading}
                                                        className="h-8 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-bold rounded-full transition-all disabled:opacity-30"
                                                    >
                                                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                                                        Import
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Backup Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                                            {backups.map((b) => (
                                                <Card key={b.id} className="bg-white/5 border-white/5 p-6 flex flex-col gap-6 group hover:border-white/20 hover:bg-white/[0.08] transition-all rounded-[2rem] shadow-xl overflow-hidden relative">
                                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                        <Package className="w-24 h-24 -mr-8 -mt-8 rotate-12" />
                                                    </div>

                                                    <div className="flex items-start justify-between relative z-10">
                                                        <div className="flex flex-col">
                                                            <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors text-lg truncate pr-16">{b.name}</h4>
                                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                {/* Backup Type Badge */}
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ring-1",
                                                                    b.backup_type === 'published'
                                                                        ? "bg-green-500/10 text-green-400 ring-green-500/20"
                                                                        : b.backup_type === 'draft'
                                                                            ? "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20"
                                                                            : "bg-blue-500/10 text-blue-400 ring-blue-500/20"
                                                                )}>
                                                                    {b.backup_type === 'published' ? '🟢 Production' : b.backup_type === 'draft' ? '🟡 Draft' : '🔵 Both'}
                                                                </span>
                                                                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500 ring-1 ring-white/5">
                                                                    {Array.isArray(b.snapshot_json) ? b.snapshot_json.length : 0} Sections
                                                                </span>
                                                                <span className="text-[10px] text-zinc-600">•</span>
                                                                <span className="text-[10px] text-zinc-500 font-mono">
                                                                    {formatRelativeTime(new Date(b.created_at))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Download buttons row */}
                                                    <div className="flex items-center gap-2 relative z-10">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex-1 h-8 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border-0 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                                                            onClick={() => downloadBackupAsJson(b)}
                                                        >
                                                            <FileJson className="w-3.5 h-3.5 mr-1.5" />
                                                            JSON
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex-1 h-8 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border-0 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                                                            onClick={() => downloadBackupAsMarkdown(b)}
                                                        >
                                                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                                                            Markdown
                                                        </Button>
                                                    </div>

                                                    {/* Action buttons row */}
                                                    <div className="flex items-center gap-3 mt-auto relative z-10">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="flex-1 bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 border-0 text-white font-bold text-xs h-10 rounded-2xl transition-all backdrop-blur-sm"
                                                            onClick={() => {
                                                                setRestoreOptions({
                                                                    backupId: b.id,
                                                                    restorePublished: false,
                                                                    restoreDraft: true
                                                                })
                                                                setRestoreModalOpen(true)
                                                            }}
                                                        >
                                                            <RotateCcw className="w-4 h-4 mr-2" />
                                                            Restore Point
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 bg-white/5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
                                                            onClick={() => triggerConfirm(
                                                                'delete-b',
                                                                b.id,
                                                                'Purge Snapshot?',
                                                                'This backup point and all its component states will be permanently deleted.'
                                                            )}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                            {backups.length === 0 && !loading && (
                                                <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-zinc-600 gap-4">
                                                    <AlertCircle className="w-12 h-12 opacity-20" />
                                                    <p className="font-bold uppercase tracking-widest text-xs">No snapshots preserved</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            )}
                        </div>
                    </div>
                </Tabs>

                {/* Status Floor */}
                <div className="px-8 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", loading ? "bg-blue-500 animate-ping" : "bg-emerald-500 ring-4 ring-emerald-500/20")} />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">
                                {loading ? "Synchronizing Cloud Data..." : "Version System Online"}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-[10px] text-zinc-600 font-mono">ENCRYPTED NODE: {focusSectionId?.slice(0, 16) || "IDLE"}</span>
                    </div>
                </div>

                {/* Overlays */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center"
                        >
                            <div className="flex flex-col items-center gap-6 p-12 bg-zinc-900/90 rounded-[3rem] border border-white/10 shadow-3xl">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin shadow-2xl" />
                                    <History className="absolute inset-0 m-auto w-6 h-6 text-blue-500/50 animate-pulse" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-lg font-black text-white tracking-tight">Syncing State...</p>
                                    <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Delta negotiation in progress</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Restore Options Modal */}
            <AnimatePresence>
                {restoreModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4"
                        onClick={() => setRestoreModalOpen(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-zinc-900/95 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-500/20 rounded-xl">
                                    <RotateCcw className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Restore Options</h3>
                                    <p className="text-xs text-zinc-500">Select what to restore from this backup</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <label className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors group">
                                    <input
                                        type="checkbox"
                                        checked={restoreOptions?.restorePublished ?? true}
                                        onChange={(e) => setRestoreOptions(restoreOptions ? {
                                            ...restoreOptions,
                                            restorePublished: e.target.checked
                                        } : null)}
                                        className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500/50"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-white text-sm group-hover:text-green-300 transition-colors">
                                            Restore Published <span className="text-green-500">(Production)</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">Replaces current live production version</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors group">
                                    <input
                                        type="checkbox"
                                        checked={restoreOptions?.restoreDraft ?? false}
                                        onChange={(e) => setRestoreOptions(restoreOptions ? {
                                            ...restoreOptions,
                                            restoreDraft: e.target.checked
                                        } : null)}
                                        className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500/50"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-white text-sm group-hover:text-yellow-300 transition-colors">
                                            Restore Draft <span className="text-yellow-500">(Staging)</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">Replaces current draft/staging version</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setRestoreModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRestore}
                                    disabled={loading || (!restoreOptions?.restorePublished && !restoreOptions?.restoreDraft)}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl disabled:opacity-30"
                                >
                                    {loading ? 'Restoring...' : 'Restore'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Dialog */}
            <ConfirmationModal
                isOpen={confOpen}
                onClose={() => setConfOpen(false)}
                onConfirm={handleConfirmedAction}
                title={confAction?.title || ''}
                description={confAction?.desc || ''}
                loading={loading}
                variant={confAction?.type === 'error' ? 'danger' : confAction?.type === 'info' ? 'info' : 'warning'}
                confirmText={confAction?.type === 'info' || confAction?.type === 'error' ? 'OK' : 'Confirm'}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    )
}
