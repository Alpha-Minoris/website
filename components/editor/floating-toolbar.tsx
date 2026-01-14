'use client'

import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, Trash2, GripVertical } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { deleteSection, updateSectionOrder } from '@/actions/section-actions'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FloatingToolbarProps {
    id: string
}

export function FloatingToolbar({ id }: FloatingToolbarProps) {
    const { blocks, removeBlock, setSelectedBlockId } = useEditorStore()
    const router = useRouter()

    const handleMove = async (direction: 'up' | 'down') => {
        // ... (keep handleMove logic exactly as is) ...
        const currentIndex = blocks.findIndex(b => b.id === id)
        if (currentIndex === -1) return
        if (direction === 'up' && currentIndex === 0) return
        if (direction === 'down' && currentIndex === blocks.length - 1) return

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        const newBlocks = [...blocks]
        const temp = newBlocks[currentIndex]
        newBlocks[currentIndex] = newBlocks[targetIndex]
        newBlocks[targetIndex] = temp

        const updates = newBlocks.map((block, index) => ({
            id: block.id,
            sort_order: index + 1
        }))

        try {
            await updateSectionOrder(updates)
        } catch (error) {
            console.error("Failed to reorder:", error)
            alert("Failed to reorder. See console.")
        }
    }

    const handleDelete = async () => {
        // Confirmation is now handled by AlertDialog
        try {
            const result = await deleteSection(id)
            if (result.success) {
                removeBlock(id)
                setSelectedBlockId(null)
            }
        } catch (error) {
            console.error("Failed to delete:", error)
            alert("Failed to delete. Check console for details.")
        }
    }

    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/90 text-white p-1.5 rounded-md shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 z-[60]">
            <div className="mr-2 text-xs font-medium px-2 text-white/50 border-r border-white/10 flex items-center gap-2 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
                <span>Section</span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/20 text-white"
                onClick={(e) => { e.stopPropagation(); handleMove('up') }}
            >
                <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/20 text-white"
                onClick={(e) => { e.stopPropagation(); handleMove('down') }}
            >
                <ArrowDown className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-white/20 mx-1" />

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this section from the website.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.stopPropagation(); handleDelete() }}
                            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
