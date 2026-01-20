import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Fetch all presets (global, shared by all users)
        const { data: presets, error } = await supabase
            .from('website_color_presets')
            .select('*')
            .order('is_default', { ascending: false }) // Defaults first
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching presets:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // PERFORMANCE: Enable Vercel edge caching
        // public: cacheable by CDN
        // s-maxage=600: CDN caches for 10 minutes
        // stale-while-revalidate=3600: Serve stale data while revalidating for 1 hour
        return NextResponse.json(
            { presets: presets || [] },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600'
                }
            }
        )
    } catch (error: any) {
        console.error('Preset fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const body = await request.json()
        const { name, type, value } = body

        if (!name || !type || !value) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check total preset limit (max 5 custom presets globally)
        const { data: existingPresets, error: countError } = await supabase
            .from('website_color_presets')
            .select('id')
            .eq('is_default', false)

        if (countError) {
            return NextResponse.json({ error: countError.message }, { status: 500 })
        }

        if (existingPresets && existingPresets.length >= 5) {
            return NextResponse.json({
                error: 'Maximum 5 custom presets allowed. Delete an existing preset first.'
            }, { status: 400 })
        }

        // Create new preset (global, available to all users)
        const { data: newPreset, error: insertError } = await supabase
            .from('website_color_presets')
            .insert({
                name,
                type,
                value,
                is_default: false
            })
            .select()
            .single()

        if (insertError) {
            // Check for unique constraint violation
            if (insertError.code === '23505') {
                return NextResponse.json({
                    error: 'A preset with this name already exists'
                }, { status: 400 })
            }
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json({ preset: newPreset }, { status: 201 })
    } catch (error: any) {
        console.error('Preset creation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
