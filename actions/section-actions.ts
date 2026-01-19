'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { checkEditRights } from '@/lib/auth-utils'

export async function createGenericSection() {
    if (!(await checkEditRights({ actionType: 'create' }))) {
        throw new Error('Unauthorized')
    }

    const supabase = await createAdminClient()
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()

    // TEMPORARY: Bypass auth for local dev/testing of editor
    // if (!user) {
    //     throw new Error('Unauthorized')
    // }

    // 1. Get current max sort_order
    const { data: maxOrderData } = await supabase
        .from('website_sections')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

    const nextSortOrder = (maxOrderData?.sort_order ?? 0) + 1
    const newSlug = `section-${uuidv4().slice(0, 8)}`

    // 2. Create the section
    const { data: section, error: sectionError } = await supabase
        .from('website_sections')
        .insert({
            slug: newSlug,
            title: 'New Generic Section',
            sort_order: nextSortOrder,
            is_enabled: true
        })
        .select()
        .single()

    if (sectionError) throw sectionError

    // 3. Create the initial version (published immediately for now)
    const { data: version, error: versionError } = await supabase
        .from('website_section_versions')
        .insert({
            section_id: section.id,
            status: 'published',
            layout_json: { type: 'generic-section', content: [], settings: {} },
            created_by: user?.id ?? null
        })
        .select()
        .single()

    if (versionError) throw versionError

    // 4. Update the section to point to this published version
    const { error: updateError } = await supabase
        .from('website_sections')
        .update({ published_version_id: version.id })
        .eq('id', section.id)

    if (updateError) throw updateError

    revalidatePath('/')
    return { success: true, sectionId: section.id }
}

export async function deleteSection(sectionId: string) {
    if (!(await checkEditRights({ sectionId, actionType: 'delete' }))) {
        throw new Error('Unauthorized')
    }

    const supabase = await createAdminClient()
    // const authClient = await createClient()
    // const { data: { user } } = await authClient.auth.getUser()

    // if (!user) {
    //     throw new Error('Unauthorized')
    // }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sectionId)

    let query = supabase.from('website_sections').delete()
    if (isUuid) {
        query = query.eq('id', sectionId)
    } else {
        query = query.eq('slug', sectionId)
    }

    const { error } = await query

    if (error) throw error

    revalidatePath('/')
    return { success: true }
}

export async function updateSectionOrder(items: { id: string; sort_order: number }[]) {
    if (!(await checkEditRights({ actionType: 'update' }))) {
        throw new Error('Unauthorized')
    }

    const supabase = await createAdminClient()
    // const authClient = await createClient()
    // const { data: { user } } = await authClient.auth.getUser()

    // if (!user) {
    //     throw new Error('Unauthorized')
    // }

    // Upsert optimization for batch updates isn't straightforward with Supabase JS wrapper 
    // without a specific rpc or making multiple calls. 
    // For < 20 sections, Promise.all is acceptable.

    const updates = items.map(item => {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
        let query = supabase.from('website_sections').update({ sort_order: item.sort_order })

        if (isUuid) {
            query = query.eq('id', item.id)
        } else {
            query = query.eq('slug', item.id)
        }
        return query
    })

    await Promise.all(updates)

    revalidatePath('/')
    await Promise.all(updates)

    revalidatePath('/')
    return { success: true }
}

export async function updateSection(sectionId: string, updates: { title?: string }) {
    if (!(await checkEditRights({ sectionId, actionType: 'update' }))) {
        throw new Error('Unauthorized')
    }

    const supabase = await createAdminClient()

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sectionId)

    let query = supabase.from('website_sections').update(updates)
    if (isUuid) {
        query = query.eq('id', sectionId)
    } else {
        query = query.eq('slug', sectionId)
    }

    const { error } = await query

    if (error) throw error

    revalidatePath('/')
    return { success: true }
}

export async function updateSectionVisibility(sectionId: string, isEnabled: boolean) {
    if (!(await checkEditRights({ sectionId, actionType: 'update' }))) {
        throw new Error('Unauthorized')
    }

    const supabase = await createAdminClient()

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sectionId)

    let query = supabase.from('website_sections').update({ is_enabled: isEnabled })
    if (isUuid) {
        query = query.eq('id', sectionId)
    } else {
        query = query.eq('slug', sectionId)
    }

    const { error } = await query

    if (error) throw error

    revalidatePath('/')
    return { success: true }
}
