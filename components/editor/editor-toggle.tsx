'use client'

import { Button } from '@/components/ui/button'
import { Pencil, X } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function EditorToggle() {
    const { isEditMode, toggleEditMode, dirtyBlockIds } = useEditorStore()
    const [showExitDialog, setShowExitDialog] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleToggle = () => {
        if (!isEditMode) {
            toggleEditMode()
            return
        }

        const { dirtyBlockIds, autoSaveEnabled } = useEditorStore.getState()

        if (dirtyBlockIds.size > 0 && !autoSaveEnabled) {
            // Show dialog for confirmation
            setShowExitDialog(true)
        } else if (dirtyBlockIds.size > 0 && autoSaveEnabled) {
            // Auto-save before exit
            handleSaveAndExit()
        } else {
            // No changes, exit immediately
            toggleEditMode()
        }
    }

    const handleSaveAndExit = async () => {
        const { saveToServer } = useEditorStore.getState()
        setIsSaving(true)
        try {
            await saveToServer()
            toggleEditMode()
        } catch (error) {
            console.error('Save failed:', error)
        } finally {
            setIsSaving(false)
            setShowExitDialog(false)
        }
    }

    const handleDiscardAndExit = () => {
        toggleEditMode()
        setShowExitDialog(false)
    }

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-2xl bg-white text-black hover:bg-white/90"
                    onClick={handleToggle}
                >
                    <AnimatePresence mode="wait">
                        {isEditMode ? (
                            <motion.div
                                key="close"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                            >
                                <X className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="edit"
                                initial={{ scale: 0, rotate: 90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -90 }}
                            >
                                <Pencil className="w-5 h-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </div>

            {/* Exit Confirmation Dialog */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent className="bg-zinc-900/90 border-white/10 backdrop-blur-2xl text-white rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            You have {dirtyBlockIds.size} unsaved change{dirtyBlockIds.size > 1 ? 's' : ''}. What would you like to do?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setShowExitDialog(false)}
                            className="bg-transparent border-zinc-800 hover:bg-zinc-800 text-white hover:text-white"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            variant="destructive"
                            onClick={handleDiscardAndExit}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                        >
                            Discard
                        </Button>
                        <AlertDialogAction
                            onClick={handleSaveAndExit}
                            disabled={isSaving}
                            className="bg-green-600 hover:bg-green-700 text-white border-none"
                        >
                            {isSaving ? 'Saving...' : 'Save & Exit'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
