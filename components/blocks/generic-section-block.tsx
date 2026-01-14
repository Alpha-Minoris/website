'use client'

import React from 'react'
import { BlockProps } from './types'

export function GenericSectionBlock({ id, content }: BlockProps) {
    return (
        <div className="py-20 px-4 bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-2xl font-bold mb-2 text-muted-foreground">New Section</h3>
            <p className="text-muted-foreground/70">Click to edit or drag blocks here.</p>
        </div>
    )
}
