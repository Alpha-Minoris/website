'use client'

import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddButtonProps {
    onClick: () => void
    isEditMode: boolean
    className?: string
    title?: string
}

export function AddButton({ onClick, isEditMode, className, title = "Add new item" }: AddButtonProps) {
    if (!isEditMode) return null
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            className={cn(
                "inline-flex items-center justify-center p-1 rounded-full bg-accent/20 text-accent hover:bg-accent hover:text-white transition-all shadow-lg shadow-accent/20",
                className
            )}
            title={title}
        >
            <Plus size={14} />
        </button>
    )
}

interface DeleteButtonProps {
    onClick: () => void
    isEditMode: boolean
    className?: string
    title?: string
}

export function DeleteButton({ onClick, isEditMode, className, title = "Remove item" }: DeleteButtonProps) {
    if (!isEditMode) return null
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            contentEditable={false}
            className={cn(
                "p-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100",
                className
            )}
            title={title}
        >
            <Trash2 size={12} />
        </button>
    )
}
