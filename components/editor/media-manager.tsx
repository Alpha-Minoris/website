'use client'

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Upload,
    Globe,
    Library,
    X,
    Image as ImageIcon,
    Loader2,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    Folder
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { uploadAsset, deleteAsset, listAssets, renameAsset } from "../../actions/storage-actions"
import { DeleteButton } from "@/components/editor/editable-list-controls"
import { autoOptimize } from "@/lib/utils/image-utils"
import { Zap } from "lucide-react"

interface MediaManagerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (asset: { type: 'image', value: string }) => void
    folder?: string // Contextual folder (e.g. section slug)
}

export function MediaManager({ open, onOpenChange, onSelect, folder }: MediaManagerProps) {
    const [activeTab, setActiveTab] = React.useState("library")
    const [uploading, setUploading] = React.useState(false)
    const [library, setLibrary] = React.useState<any[]>([])
    const [loadingLibrary, setLoadingLibrary] = React.useState(false)
    const [externalUrl, setExternalUrl] = React.useState("")
    const [dragActive, setDragActive] = React.useState(false)
    const [headerError, setHeaderError] = React.useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)
    const [selectedLibraryItem, setSelectedLibraryItem] = React.useState<any | null>(null)

    // Explorer State
    const [currentPath, setCurrentPath] = React.useState(folder || "")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [editingPath, setEditingPath] = React.useState<string | null>(null)
    const [newName, setNewName] = React.useState("")
    const [allFolders, setAllFolders] = React.useState<string[]>([])
    const [optimizing, setOptimizing] = React.useState(false)

    const supabase = createClient()

    // Fetch library recursively if searching, or specifically if not
    const fetchLibrary = React.useCallback(async (path: string = "") => {
        setLoadingLibrary(true)
        setHeaderError(null)
        try {
            const result = await listAssets(path)
            if (result.error) throw new Error(result.error)
            setLibrary(result.data || [])

            // If we are in a deep path and it's empty, but we have a root folder,
            // we might want to show folders if we implement a sidebar later.
        } catch (err: any) {
            console.error("Error fetching library:", err)
            setHeaderError(err.message || "Error fetching library.")
        } finally {
            setLoadingLibrary(false)
        }
    }, [])

    React.useEffect(() => {
        if (open && activeTab === "library") {
            fetchLibrary(currentPath)

            // Also fetch root folders for the quick-switch bar if not already loaded
            if (allFolders.length === 0) {
                listAssets("").then(res => {
                    if (res.data) {
                        const folders = res.data.filter(i => !i.metadata).map(i => i.name)
                        setAllFolders(folders)
                    }
                })
            }
        }
    }, [open, activeTab, currentPath, fetchLibrary, allFolders.length])

    const handleUpload = async (file: File) => {
        // Only optimize if it's an image and not already a small SVG/optimized file
        let fileToUpload = file
        if (file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
            try {
                setUploading(true)
                setHeaderError(null)
                fileToUpload = await autoOptimize(file)
            } catch (err) {
                console.warn("Optimization failed, uploading original:", err)
            }
        }

        if (fileToUpload.size > 5 * 1024 * 1024) {
            setHeaderError("File too large. Max 5MB.")
            setUploading(false)
            return
        }

        try {
            setUploading(true)
            setHeaderError(null)

            const formData = new FormData()
            formData.append('file', fileToUpload)
            formData.append('folder', currentPath || folder || "")

            const result = await uploadAsset(formData)

            if (result.error) {
                throw new Error(result.error)
            }

            if (result.publicUrl) {
                // Return to library view and refresh
                setActiveTab("library")
                await fetchLibrary(currentPath)

                // Select the new asset
                if (result.fileName) {
                    const shortName = result.fileName.split('/').pop() || result.fileName
                    // Set as selected immediately
                    setSelectedLibraryItem({
                        name: shortName,
                        created_at: new Date().toISOString(),
                        metadata: { size: fileToUpload.size }
                    } as any)
                }
            }
        } catch (err: any) {
            console.error("Error uploading image:", err)
            setHeaderError(err.message || "Error uploading image.")
        } finally {
            setUploading(false)
        }
    }

    const handleOptimizeSelected = async () => {
        if (!selectedLibraryItem) return

        const fullPath = currentPath ? `${currentPath}/${selectedLibraryItem.name}` : selectedLibraryItem.name
        const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fullPath)

        setOptimizing(true)
        setHeaderError(null)

        try {
            // 1. Fetch the image
            const response = await fetch(publicUrl)
            const blob = await response.blob()

            // 2. Wrap in File object
            const originalName = selectedLibraryItem.name.replace(/\.[^/.]+$/, "")
            const file = new File([blob], `${originalName}-optimized.webp`, { type: blob.type })

            // 3. Optimize
            const optimizedFile = await autoOptimize(file)

            // 4. Upload
            const formData = new FormData()
            formData.append('file', optimizedFile)
            formData.append('folder', currentPath || "")

            const result = await uploadAsset(formData)

            if (result.error) throw new Error(result.error)

            // 5. Success - Refresh
            await fetchLibrary(currentPath)

            // 6. Select the new optimized one
            if (result.fileName) {
                const shortName = result.fileName.split('/').pop() || result.fileName
                setSelectedLibraryItem({
                    name: shortName,
                    created_at: new Date().toISOString(),
                    metadata: { size: optimizedFile.size }
                } as any)
            }

        } catch (err: any) {
            console.error("Manual optimization error:", err)
            setHeaderError("Failed to optimize: " + (err.message || "Unknown error"))
        } finally {
            setOptimizing(false)
        }
    }

    const handleDelete = async (name: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        // Full path is needed for deletion
        const fullPath = currentPath ? `${currentPath}/${name}` : name
        setDeleteConfirm(fullPath)
    }

    const confirmDelete = async () => {
        if (!deleteConfirm) return

        setHeaderError(null)
        try {
            const result = await deleteAsset(deleteConfirm)
            if (result.error) throw new Error(result.error)

            if (selectedLibraryItem?.name === deleteConfirm.split('/').pop()) {
                setSelectedLibraryItem(null)
            }

            fetchLibrary(currentPath)
        } catch (err: any) {
            console.error("Error deleting image:", err)
            setHeaderError(err.message || "Error deleting image.")
        } finally {
            setDeleteConfirm(null)
        }
    }

    const handleRename = async () => {
        if (!editingPath || !newName) return

        try {
            const result = await renameAsset(editingPath, newName)
            if (result.error) throw new Error(result.error)

            fetchLibrary(currentPath)
            setEditingPath(null)
        } catch (err: any) {
            setHeaderError(err.message || "Error renaming file.")
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0])
        }
    }

    const filteredItems = React.useMemo(() => {
        if (!searchQuery) return library
        return library.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [library, searchQuery])

    const breadcrumbs = React.useMemo(() => {
        const parts = currentPath.split('/').filter(Boolean)
        return [{ name: 'Root', path: '' }, ...parts.map((p, i) => ({
            name: p,
            path: parts.slice(0, i + 1).join('/')
        }))]
    }, [currentPath])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[85vh] bg-zinc-950 border-zinc-800 shadow-2xl p-0 overflow-hidden rounded-3xl flex flex-col">
                <div className="p-6 pb-2">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-accent" />
                            Media Explorer
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Manage your images in organized folders. Double-click to rename.
                        </DialogDescription>
                    </DialogHeader>

                    {headerError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1 mt-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" />
                                <span>{headerError}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-500/20" onClick={() => setHeaderError(null)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    {deleteConfirm && (
                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs p-3 rounded-xl flex items-center justify-between animate-in fade-in scale-in-95 mt-4">
                            <span>Delete <span className="text-white font-mono">{deleteConfirm}</span>?</span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-400 hover:text-white" onClick={() => setDeleteConfirm(null)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" size="sm" className="h-7 px-2" onClick={confirmDelete}>
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between px-6 border-b border-white/5 bg-zinc-950/50">
                        <TabsList className="bg-transparent rounded-none h-auto p-0 gap-6 shrink-0">
                            <TabsTrigger value="library" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none h-12 px-0 text-zinc-400 font-medium transition-all">
                                <Library className="w-4 h-4 mr-2" /> Library
                            </TabsTrigger>
                            <TabsTrigger value="upload" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none h-12 px-0 text-zinc-400 font-medium transition-all">
                                <Upload className="w-4 h-4 mr-2" /> Upload
                            </TabsTrigger>
                            <TabsTrigger value="url" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none h-12 px-0 text-zinc-400 font-medium transition-all">
                                <Globe className="w-4 h-4 mr-2" /> URL
                            </TabsTrigger>
                        </TabsList>

                        {activeTab === "library" && (
                            <div className="relative w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-accent transition-colors" />
                                <Input
                                    placeholder="Search library..."
                                    className="bg-zinc-900/50 border-white/5 h-8 pl-9 text-[10px] uppercase tracking-widest font-bold focus:border-accent/50 focus:ring-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden relative">
                        <TabsContent value="library" className="mt-0 h-full p-0">
                            <div className="flex flex-col h-full">
                                {/* Navigation Bar */}
                                <div className="px-6 py-2 bg-zinc-900/30 flex items-center gap-1 shrink-0 border-b border-white/5 overflow-x-auto no-scrollbar">
                                    <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
                                        <Folder className="w-3 h-3 text-zinc-500" />
                                        <span className="text-[10px] text-zinc-600 uppercase font-black tracking-tighter">Folders</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPath("")}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                                currentPath === "" ? "bg-accent text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
                                            )}
                                        >
                                            Root
                                        </button>
                                        {allFolders.map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setCurrentPath(f)}
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                                    currentPath === f ? "bg-accent text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
                                                )}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Breadcrumbs */}
                                <div className="px-6 py-1.5 bg-zinc-900/10 flex items-center gap-1 shrink-0 border-b border-white/5">
                                    {breadcrumbs.map((bc, idx) => (
                                        <React.Fragment key={bc.path}>
                                            {idx > 0 && <ChevronRight className="w-2.5 h-2.5 text-zinc-800 mx-0.5" />}
                                            <button
                                                onClick={() => setCurrentPath(bc.path)}
                                                className={cn(
                                                    "text-[9px] uppercase tracking-wider font-bold hover:text-accent transition-colors",
                                                    idx === breadcrumbs.length - 1 ? "text-white" : "text-zinc-600"
                                                )}
                                            >
                                                {bc.name}
                                            </button>
                                        </React.Fragment>
                                    ))}
                                </div>

                                {loadingLibrary ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
                                    </div>
                                ) : (
                                    <div className="flex flex-1 h-full min-h-0">
                                        {/* File/Folder List */}
                                        <div className="w-1/2 border-r border-white/5 overflow-y-auto custom-scrollbar bg-zinc-950">
                                            {filteredItems.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-2 opacity-50">
                                                    <Library className="w-8 h-8" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">No results found</p>
                                                </div>
                                            ) : (
                                                filteredItems.map((item) => {
                                                    const isFolder = !item.metadata
                                                    const isSelected = selectedLibraryItem?.name === item.name && !isFolder
                                                    const fullItemPath = currentPath ? `${currentPath}/${item.name}` : item.name
                                                    const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fullItemPath)

                                                    return (
                                                        <div
                                                            key={item.id || item.name}
                                                            className={cn(
                                                                "group flex items-center gap-3 px-6 py-3 border-b border-white/5 cursor-pointer transition-colors relative",
                                                                isSelected ? "bg-accent/10" : "hover:bg-white/5"
                                                            )}
                                                            onClick={() => {
                                                                if (isFolder) {
                                                                    setCurrentPath(fullItemPath)
                                                                    setSelectedLibraryItem(null)
                                                                } else {
                                                                    setSelectedLibraryItem(item)
                                                                }
                                                            }}
                                                            onDoubleClick={(e) => {
                                                                if (!isFolder) {
                                                                    setEditingPath(fullItemPath)
                                                                    setNewName(item.name)
                                                                }
                                                            }}
                                                        >
                                                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                                                {isFolder ? (
                                                                    <Folder className="w-5 h-5 text-zinc-600 group-hover:text-accent transition-colors" />
                                                                ) : (
                                                                    <img src={publicUrl} className="w-full h-full object-cover" alt="" />
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                {editingPath === fullItemPath ? (
                                                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                                        <Input
                                                                            value={newName}
                                                                            onChange={e => setNewName(e.target.value)}
                                                                            className="h-7 text-xs py-1 bg-zinc-800 border-accent"
                                                                            autoFocus
                                                                            onKeyDown={e => {
                                                                                if (e.key === 'Enter') handleRename()
                                                                                if (e.key === 'Escape') setEditingPath(null)
                                                                            }}
                                                                        />
                                                                        <Button size="icon" className="h-7 w-7 bg-accent text-white" onClick={handleRename}>
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <p className={cn(
                                                                            "text-xs font-bold tracking-wide truncate",
                                                                            isSelected ? "text-accent" : "text-zinc-300"
                                                                        )}>
                                                                            {item.name}
                                                                        </p>
                                                                        <p className="text-[10px] text-zinc-600 font-mono">
                                                                            {isFolder ? 'Folder' : `${(item.metadata.size / 1024).toFixed(1)} KB`}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {!isFolder && (
                                                                <div className="opacity-0 group-hover:opacity-100 transition-all scale-75">
                                                                    <DeleteButton
                                                                        onClick={() => handleDelete(item.name)}
                                                                        isEditMode={true}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>

                                        {/* Right Panel: Preview Area */}
                                        <div className="w-1/2 flex flex-col bg-zinc-900/40 relative">
                                            {selectedLibraryItem ? (
                                                <>
                                                    <div className="flex-1 p-10 flex flex-col items-center justify-center gap-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="relative w-full aspect-square max-w-[300px] rounded-3xl border border-white/10 bg-black shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
                                                            <img
                                                                src={supabase.storage.from('site-assets').getPublicUrl(selectedLibraryItem.fullPath || (currentPath ? `${currentPath}/${selectedLibraryItem.name}` : selectedLibraryItem.name)).data.publicUrl}
                                                                className="w-full h-full object-contain p-4 transition-opacity duration-300"
                                                                alt=""
                                                                onLoad={(e) => (e.target as HTMLImageElement).style.opacity = '1'}
                                                                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/000000/FFFFFF?text=Preview+Error'}
                                                            />
                                                        </div>
                                                        <div className="w-full max-w-[300px] space-y-4">
                                                            <div>
                                                                <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-black pb-1 border-b border-white/5">Asset Details</p>
                                                                <div className="pt-3 space-y-2">
                                                                    <p className="text-xs text-zinc-400 font-mono truncate">{selectedLibraryItem.name}</p>
                                                                    <p className="text-[10px] text-zinc-500 font-mono uppercase">
                                                                        Size: {(selectedLibraryItem.metadata.size / 1024).toFixed(2)} KB
                                                                    </p>
                                                                    <p className="text-[10px] text-zinc-500 font-mono uppercase">
                                                                        Added: {new Date(selectedLibraryItem.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-6 bg-zinc-950/80 border-t border-white/5 flex gap-3 backdrop-blur-xl">
                                                        <DeleteButton
                                                            onClick={() => handleDelete(selectedLibraryItem.name)}
                                                            isEditMode={true}
                                                            size={18}
                                                            strokeWidth={2.5}
                                                            className="h-12 w-12 rounded-2xl flex items-center justify-center opacity-100 group-hover:opacity-100 bg-red-500/20"
                                                        />

                                                        {selectedLibraryItem.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/) && !selectedLibraryItem.name.includes('-optimized') && (
                                                            <Button
                                                                variant="outline"
                                                                className="h-12 px-6 border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-2xl flex items-center gap-2"
                                                                onClick={handleOptimizeSelected}
                                                                disabled={optimizing}
                                                            >
                                                                {optimizing ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                                                                ) : (
                                                                    <Zap className="w-4 h-4 text-accent" />
                                                                )}
                                                                {optimizing ? 'Wait...' : 'Optimize'}
                                                            </Button>
                                                        )}

                                                        <Button
                                                            className="h-12 flex-1 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl shadow-lg shadow-accent/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                            onClick={() => {
                                                                const fullPath = currentPath ? `${currentPath}/${selectedLibraryItem.name}` : selectedLibraryItem.name
                                                                onSelect({
                                                                    type: 'image',
                                                                    value: supabase.storage.from('site-assets').getPublicUrl(fullPath).data.publicUrl
                                                                })
                                                                onOpenChange(false)
                                                            }}
                                                        >
                                                            <CheckCircle2 className="w-5 h-5" />
                                                            Apply Selection
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 select-none">
                                                    <ImageIcon className="w-20 h-20 text-zinc-700 mb-6 stroke-[1]" />
                                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 mb-2">No Asset Selected</p>
                                                    <p className="text-xs text-zinc-600 max-w-[200px]">Select an image or folder from the list to see more details.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="upload" className="mt-0 h-full p-8">
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={cn(
                                    "w-full h-full border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all gap-6 bg-white/5",
                                    dragActive ? "border-accent bg-accent/5 ring-4 ring-accent/10" : "border-white/10 hover:border-white/20"
                                )}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-4 animate-pulse">
                                        <Loader2 className="w-12 h-12 text-accent animate-spin" />
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Syncing with Cloud Storage...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                                            <Upload className="w-8 h-8 text-accent" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-lg text-white font-bold">New Asset Upload</p>
                                            <p className="text-xs text-zinc-500">
                                                Image will be placed in: <span className="text-accent font-mono">/{(currentPath || folder || 'root')}</span>
                                            </p>
                                        </div>
                                        <label className="cursor-pointer group">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                                            />
                                            <div className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all">
                                                Browse Files
                                            </div>
                                        </label>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="url" className="mt-0 h-full p-8 space-y-6">
                            <div className="max-w-xl mx-auto space-y-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">Source URL</p>
                                    <div className="flex gap-2 p-1.5 bg-zinc-900 border border-white/5 rounded-2xl focus-within:border-accent/50 transition-all">
                                        <Input
                                            placeholder="https://images.unsplash.com/..."
                                            className="bg-transparent border-0 text-white flex-1 focus-visible:ring-0"
                                            value={externalUrl}
                                            onChange={(e) => setExternalUrl(e.target.value)}
                                        />
                                        <Button
                                            className="bg-accent text-white hover:bg-accent/90 rounded-xl px-6 h-10 font-bold"
                                            onClick={() => {
                                                const trimmed = externalUrl.trim()
                                                if (trimmed) onSelect({ type: 'image', value: trimmed })
                                            }}
                                            disabled={!externalUrl || !externalUrl.trim()}
                                        >
                                            Fetch
                                        </Button>
                                    </div>
                                </div>

                                {externalUrl && externalUrl.trim() && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">Live Preview</p>
                                        <div className="w-full aspect-[16/9] rounded-3xl border border-white/10 bg-black/50 overflow-hidden relative shadow-2xl">
                                            <img
                                                src={externalUrl.trim()}
                                                alt="External Preview"
                                                className="w-full h-full object-contain p-4"
                                                onError={(e) => {
                                                    setHeaderError("Failed to load image from external source.")
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
