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
    AlertCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { uploadAsset, deleteAsset, listAssets } from "@/actions/storage-actions"

interface MediaManagerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (asset: { type: 'image', value: string }) => void
}

export function MediaManager({ open, onOpenChange, onSelect }: MediaManagerProps) {
    const [activeTab, setActiveTab] = React.useState("upload")
    const [uploading, setUploading] = React.useState(false)
    const [library, setLibrary] = React.useState<any[]>([])
    const [loadingLibrary, setLoadingLibrary] = React.useState(false)
    const [externalUrl, setExternalUrl] = React.useState("")
    const [dragActive, setDragActive] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)
    const supabase = createClient()

    // Fetch library on mount or tab change (Read is public)
    const fetchLibrary = React.useCallback(async () => {
        setLoadingLibrary(true)
        setError(null)
        try {
            const result = await listAssets()
            if (result.error) throw new Error(result.error)
            setLibrary(result.data || [])
        } catch (err: any) {
            console.error("Error fetching library:", err)
            setError(err.message || "Error fetching library.")
        } finally {
            setLoadingLibrary(false)
        }
    }, [])

    React.useEffect(() => {
        if (open && activeTab === "library") {
            fetchLibrary()
        }
    }, [open, activeTab, fetchLibrary])

    const handleUpload = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            setError("File too large. Max 5MB.")
            return
        }

        try {
            setUploading(true)
            setError(null)

            const formData = new FormData()
            formData.append('file', file)

            const result = await uploadAsset(formData)

            if (result.error) {
                throw new Error(result.error)
            }

            if (result.publicUrl) {
                onSelect({ type: 'image', value: result.publicUrl })
                onOpenChange(false)
            }
        } catch (err: any) {
            console.error("Error uploading image:", err)
            setError(err.message || "Error uploading image. Make sure the storage bucket exists.")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (name: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setDeleteConfirm(name)
    }

    const confirmDelete = async () => {
        if (!deleteConfirm) return

        setError(null)
        try {
            const result = await deleteAsset(deleteConfirm)
            if (result.error) throw new Error(result.error)
            fetchLibrary()
        } catch (err: any) {
            console.error("Error deleting image:", err)
            setError(err.message || "Error deleting image.")
        } finally {
            setDeleteConfirm(null)
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 shadow-2xl p-0 overflow-hidden rounded-3xl">
                <div className="p-6 pb-2 space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-accent" />
                            Media Manager
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Upload from computer, enter URL, or choose from library.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" />
                                <span>{error}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-500/20" onClick={() => setError(null)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    {deleteConfirm && (
                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs p-3 rounded-xl flex items-center justify-between animate-in fade-in scale-in-95">
                            <span>Are you sure you want to delete this asset?</span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-400 hover:text-white" onClick={() => setDeleteConfirm(null)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" size="sm" className="h-7 px-2" onClick={confirmDelete}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none h-auto p-0 px-6 gap-6">
                        <TabsTrigger
                            value="upload"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none h-10 px-0 text-zinc-400 font-medium transition-all"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger
                            value="url"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none h-10 px-0 text-zinc-400 font-medium transition-all"
                        >
                            <Globe className="w-4 h-4 mr-2" />
                            External URL
                        </TabsTrigger>
                        <TabsTrigger
                            value="library"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none h-10 px-0 text-zinc-400 font-medium transition-all"
                        >
                            <Library className="w-4 h-4 mr-2" />
                            Library
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                        <TabsContent value="upload" className="mt-0 h-full flex items-center justify-center">
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={cn(
                                    "w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all gap-4 bg-white/5",
                                    dragActive ? "border-accent bg-accent/5" : "border-white/10"
                                )}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
                                        <p className="text-sm text-zinc-400">Uploading to secure storage...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-zinc-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-white font-medium">Drag and drop or click to upload</p>
                                            <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                        </div>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                                            />
                                            <Button variant="secondary" size="sm" className="pointer-events-none">
                                                Choose File
                                            </Button>
                                        </label>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="url" className="mt-0 space-y-4">
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://images.unsplash.com/..."
                                        className="bg-white/5 border-white/10 text-white flex-1"
                                        value={externalUrl}
                                        onChange={(e) => setExternalUrl(e.target.value)}
                                    />
                                    <Button
                                        className="bg-accent text-white hover:bg-accent/90"
                                        onClick={() => externalUrl && onSelect({ type: 'image', value: externalUrl })}
                                        disabled={!externalUrl}
                                    >
                                        Use Image
                                    </Button>
                                </div>

                                {externalUrl && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Preview</p>
                                        <div className="w-full aspect-video rounded-xl border border-white/10 bg-black/50 overflow-hidden relative group">
                                            <img
                                                src={externalUrl}
                                                alt="External Preview"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    setError("Failed to load image from URL.")
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="library" className="mt-0 h-full">
                            {loadingLibrary ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                </div>
                            ) : library.length === 0 ? (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <Library className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <p className="text-sm text-zinc-500">No images found in your library.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4 pb-4">
                                    {library.map((item) => {
                                        const { data: { publicUrl } } = supabase.storage
                                            .from('site-assets')
                                            .getPublicUrl(item.name)

                                        return (
                                            <div
                                                key={item.id}
                                                className="group relative aspect-square rounded-xl border border-white/10 bg-white/5 overflow-hidden cursor-pointer hover:border-accent/50 transition-all border-b-2"
                                                onClick={() => onSelect({ type: 'image', value: publicUrl })}
                                            >
                                                <img
                                                    src={publicUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full shadow-2xl"
                                                        onClick={(e) => handleDelete(item.name, e)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                    <CheckCircle2 className="w-6 h-6 text-accent" />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
