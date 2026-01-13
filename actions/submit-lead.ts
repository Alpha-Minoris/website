'use server'

import { createClient } from '@supabase/supabase-js' // Direct import for Service Role
import { z } from 'zod'

const LeadSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().min(1, 'Company name is required'),
    website: z.string().optional().or(z.literal('')), // Relaxed validation
})

export type FormState = {
    // ... same types
    message: string
    success: boolean
    errors?: {
        firstName?: string[]
        lastName?: string[]
        email?: string[]
        company?: string[]
        website?: string[]
    }
}

export async function submitLead(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = LeadSchema.safeParse({
        firstName: formData.get('first-name'),
        lastName: formData.get('last-name'),
        email: formData.get('email'),
        company: formData.get('company'),
        website: formData.get('website'),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { firstName, lastName, email, company, website } = validatedFields.data
    const displayName = `${firstName} ${lastName}`.trim()

    // Use Service Role to bypass RLS for public submission
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('clients').insert({
        display_name: displayName,
        legal_name: company,
        website_url: website,
        email: email,
        lifecycle_stage: 'lead'
    })

    if (error) {
        console.error('Lead Submission Error:', error)
        return {
            success: false,
            message: 'Failed to submit. Please try again later.',
        }
    }

    return {
        success: true,
        message: "Based on the table we received your info.",
    }
}
