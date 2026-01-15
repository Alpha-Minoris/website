'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitTestimonial(token: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const company = formData.get('company') as string
    const quote = formData.get('quote') as string

    if (!name || !quote) {
        throw new Error("Name and Quote are required")
    }

    // 1. Verify Token Again (Security)
    const { data: tokenRecord, error: tokenError } = await supabase
        .from('website_testimonial_tokens')
        .select('*')
        .eq('token_hash', token)
        .single()

    if (tokenError || !tokenRecord) throw new Error("Invalid token")
    if (tokenRecord.is_revoked) throw new Error("Token revoked")
    if (new Date(tokenRecord.expires_at) < new Date()) throw new Error("Token expired")
    if (tokenRecord.uses >= tokenRecord.max_uses) throw new Error("Token used")

    // 2. Insert Submission
    const { error: insertError } = await supabase
        .from('website_testimonial_submissions')
        .insert({
            token_id: tokenRecord.id,
            name,
            role,
            company,
            quote,
            status: 'pending'
        })

    if (insertError) {
        console.error("Submission error:", insertError)
        throw new Error("Failed to submit testimonial")
    }

    // 3. Increment Use Count
    await supabase
        .from('website_testimonial_tokens')
        .update({ uses: tokenRecord.uses + 1 })
        .eq('id', tokenRecord.id)

    // 4. Revalidate
    revalidatePath('/admin/testimonials')
}
