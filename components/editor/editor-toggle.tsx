'use client'

import { Button } from '@/components/ui/button'
import { Pencil, X } from 'lucide-react'
import { useEditorStore } from '@/lib/stores/editor-store'
import { motion, AnimatePresence } from 'framer-motion'

export function EditorToggle() {
    const { isEditMode, toggleEditMode } = useEditorStore()

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-2xl bg-white text-black hover:bg-white/90"
                onClick={toggleEditMode}
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
    )
}
