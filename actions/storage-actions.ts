'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { checkEditRights } from '@/lib/auth-utils'

export async function uploadAsset(formData: FormData) {
    if (!(await checkEditRights({ actionType: 'create' }))) {
        throw new Error('Unauthorized')
    }
    try {
        const file = formData.get('file') as File
        const folder = formData.get('folder') as string || '' // e.g. "hero-section"

        if (!file) {
            return { error: 'No file provided' }
        }

        const supabase = await createAdminClient()

        // Construct clean path
        const fileExt = file.name.split('.').pop()
        const uniqueId = uuidv4()
        const cleanFolderName = folder.replace(/[^a-z0-9]/gi, '-').toLowerCase()
        const filePath = folder ? `${cleanFolderName}/${uniqueId}.${fileExt}` : `${uniqueId}.${fileExt}`

        // Convert File to ArrayBuffer for uploading via server
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const { data, error } = await supabase.storage
            .from('site-assets')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (error) {
            console.error('Upload error:', error)
            return { error: error.message }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('site-assets')
            .getPublicUrl(filePath)

        // Sync with DB
        await supabase.from('website_assets').insert({
            path: filePath,
            public_url: publicUrl,
            mime_type: file.type,
            size_bytes: file.size
        })

        return { publicUrl, fileName: filePath }
    } catch (err: any) {
        console.error('Storage action error:', err)
        return { error: err.message || 'Server error during upload' }
    }
}

export async function deleteAsset(fileName: string) {
    if (!(await checkEditRights({ actionType: 'delete' }))) {
        throw new Error('Unauthorized')
    }
    try {
        const supabase = await createAdminClient()

        const { error } = await supabase.storage
            .from('site-assets')
            .remove([fileName])

        if (error) {
            console.error('Delete error:', error)
            return { error: error.message }
        }

        // Sync with DB
        await supabase.from('website_assets').delete().eq('path', fileName)

        return { success: true }
    } catch (err: any) {
        console.error('Delete action error:', err)
        return { error: err.message || 'Server error during deletion' }
    }
}

/**
 * Lists assets in a specific path
 * @param path Optional folder path (e.g. "hero-section")
 */
export async function listAssets(path: string = '') {
    try {
        const supabase = await createAdminClient()
        const { data, error } = await supabase.storage
            .from('site-assets')
            .list(path, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' }
            })

        if (error) {
            console.error('List error:', error)
            return { error: error.message }
        }

        return { data }
    } catch (err: any) {
        console.error('List action error:', err)
        return { error: err.message || 'Server error listing assets' }
    }
}

export async function renameAsset(oldPath: string, newName: string) {
    if (!(await checkEditRights({ actionType: 'update' }))) {
        throw new Error('Unauthorized')
    }
    try {
        const supabase = await createAdminClient()

        // Construct new path by replacing the filename part of the old path
        const pathParts = oldPath.split('/')
        pathParts[pathParts.length - 1] = newName
        const newPath = pathParts.join('/')

        const { error } = await supabase.storage
            .from('site-assets')
            .move(oldPath, newPath)

        if (error) {
            console.error('Rename error:', error)
            return { error: error.message }
        }

        // Sync with DB
        await supabase.from('website_assets').update({
            path: newPath
        }).eq('path', oldPath)

        return { success: true, newPath }
    } catch (err: any) {
        console.error('Rename action error:', err)
        return { error: err.message || 'Server error while renaming' }
    }
}

export async function searchAssets(query: string) {
    try {
        const supabase = await createAdminClient()
        const { data, error } = await supabase
            .from('website_assets')
            .select('*')
            .ilike('path', `%${query}%`)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Search error:', error)
            return { error: error.message }
        }

        return { data }
    } catch (err: any) {
        console.error('Search action error:', err)
        return { error: err.message || 'Server error during search' }
    }
}
