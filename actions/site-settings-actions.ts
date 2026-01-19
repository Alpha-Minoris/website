'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkEditRights } from "@/lib/auth-utils"

export async function updateSiteTheme(themeJson: any) {
    if (!(await checkEditRights({ actionType: 'update' }))) {
        throw new Error("Unauthorized")
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If on localhost, we allow bypass of role check if no user exists
    // (This matches the behavior of other actions using AdminClient)
    if (user) {
        const { data: profile } = await supabase.from('website_profiles').select('role').eq('id', user.id).single()
        if (profile && !['super_admin', 'admin'].includes(profile.role)) {
            throw new Error("Forbidden")
        }
    }

    const { error } = await supabase
        .from('website_settings')
        .update({
            theme_json: themeJson,
            updated_at: new Date().toISOString(),
            updated_by: user?.id || null
        })
        .eq('key', 'global')

    if (error) throw new Error(error.message)

    revalidatePath('/', 'layout') // Revalidate everything
}
