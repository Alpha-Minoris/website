import { BlockProps } from './types'

export function PlaceholderBlock({ type, id }: BlockProps) {
    return (
        <div className="py-20 border-b border-white/10 flex items-center justify-center bg-white/5 mx-4 my-4 rounded-xl">
            <div className="text-center space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono uppercase">
                    Block Type: {type}
                </div>
                <p className="text-muted-foreground text-sm">ID: {id}</p>
                <p className="text-xs text-white/20">Component implementation pending in Phase 2</p>
            </div>
        </div>
    )
}
