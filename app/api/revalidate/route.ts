import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route to revalidate cache
 * Called by publish action to invalidate production cache
 */
export async function POST(request: NextRequest) {
    try {
        // Validate request (optional: add secret token)
        const body = await request.json()

        console.log('[Revalidate API] Revalidating cache...')

        // Revalidate tags
        await revalidateTag('sections', {})
        await revalidateTag('versions', {})

        // Revalidate paths with layout type for full cache clear
        revalidatePath('/', 'layout')
        revalidatePath('/view', 'layout')

        console.log('[Revalidate API] ✅ Cache revalidated successfully')

        return NextResponse.json({
            revalidated: true,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('[Revalidate API] Error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
