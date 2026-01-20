import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

        const body = await request.json()
        const { name } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        // Update preset (can't update system defaults)
        const { data: updatedPreset, error } = await supabase
            .from('website_color_presets')
            .update({ name, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('is_default', false) // Can't update defaults
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
            }
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A preset with this name already exists' }, { status: 400 })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ preset: updatedPreset })
    } catch (error: any) {
        console.error('Preset update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

        // Delete preset (can't delete system defaults)
        const { error } = await supabase
            .from('website_color_presets')
            .delete()
            .eq('id', id)
            .eq('is_default', false) // Can't delete defaults

        if (error) {
            console.error('Delete error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Preset deletion error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
