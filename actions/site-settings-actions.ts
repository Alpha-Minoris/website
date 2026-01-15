'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateSiteTheme(themeJson: any) {
    const supabase = await createClient()

    // Auth check: Ensure user is admin/super_admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check role
    const { data: profile } = await supabase.from('website_profiles').select('role').eq('id', user.id).single()
    if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
        // Allow for now if no profiles exist? Or fail secure?
        // Fail secure.
        throw new Error("Forbidden")
    }

    const { error } = await supabase
        .from('website_settings')
        .update({
            theme_json: themeJson,
            updated_at: new Date().toISOString(),
            updated_by: user.id
        })
        .eq('key', 'global')

    if (error) throw new Error(error.message)

    revalidatePath('/', 'layout') // Revalidate everything
}
