'use server'

import { createClient } from '@supabase/supabase-js' // Direct import for Service Role
import { z } from 'zod'

const LeadSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().min(1, 'Company name is required'),
    message: z.string().optional().or(z.literal('')),
})

export type FormState = {
    message: string
    success: boolean
    errors?: {
        firstName?: string[]
        lastName?: string[]
        jobTitle?: string[]
        email?: string[]
        company?: string[]
        message?: string[]
    }
}

export async function submitLead(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = LeadSchema.safeParse({
        firstName: formData.get('first-name'),
        lastName: formData.get('last-name'),
        jobTitle: formData.get('job-title'),
        email: formData.get('email'),
        company: formData.get('company'),
        message: formData.get('message'),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { firstName, lastName, jobTitle, email, company, message } = validatedFields.data
    const displayName = `${firstName} ${lastName}`.trim()

    // Use Service Role to bypass RLS for public submission
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('clients').insert({
        display_name: displayName,
        first_name: firstName,
        last_name: lastName,
        job_title: jobTitle,
        legal_name: company,
        email: email,
        message: message || null,
        lifecycle_stage: 'lead'
    })

    if (error) {
        console.error('Lead Submission Error:', error)
        return {
            success: false,
            message: 'Failed to submit. Please try again later.',
        }
    }

    // Send email notification (don't block on failure)
    try {
        const { sendContactFormEmail } = await import('@/lib/email/contact-form-email')

        await sendContactFormEmail(
            { firstName, lastName, jobTitle, email, company, message },
            {
                from: process.env.SMTP_ALIAS || process.env.SMTP_USER || 'contact-form@alpha-minoris.ai',
                to: process.env.SMTP_ALERT_USER || 'farbodnezami@gmail.com'
            }
        )
    } catch (emailError) {
        console.error('Email notification failed (non-blocking):', emailError)
        // Don't fail the form submission if email fails
    }

    return {
        success: true,
        message: "We will get in touch with you in the coming days.",
    }
}
