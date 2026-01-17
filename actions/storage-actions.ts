'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function uploadAsset(formData: FormData) {
    try {
        const file = formData.get('file') as File
        if (!file) {
            return { error: 'No file provided' }
        }

        const supabase = await createAdminClient()

        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${fileName}`

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

        return { publicUrl, fileName: filePath }
    } catch (err: any) {
        console.error('Storage action error:', err)
        return { error: err.message || 'Server error during upload' }
    }
}

export async function deleteAsset(fileName: string) {
    try {
        const supabase = await createAdminClient()

        const { error } = await supabase.storage
            .from('site-assets')
            .remove([fileName])

        if (error) {
            console.error('Delete error:', error)
            return { error: error.message }
        }

        return { success: true }
    } catch (err: any) {
        console.error('Delete action error:', err)
        return { error: err.message || 'Server error during deletion' }
    }
}

export async function listAssets() {
    try {
        const supabase = await createAdminClient()
        const { data, error } = await supabase.storage.from('site-assets').list()

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
