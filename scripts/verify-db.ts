
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verify() {
    console.log('Verifying DB Tables...')

    // We can't query information_schema easily with anon key usually, 
    // but we can try to select from the tables to see if they exist (RLS permitting on public ones).
    // Or if we have service_role key... we probably don't in .env.local usually (it's NEXT_PUBLIC).
    // But the user might have put it there? 
    // Let's assume we test the "Public Read" tables.


    // Detailed Table Checks
    const checks = [
        { table: 'website_profiles', min: 0, name: 'Profiles' },
        { table: 'website_settings', min: 1, name: 'Site Settings' },
        { table: 'website_assets', min: 0, name: 'Assets' },
        { table: 'website_sections', min: 10, name: 'Sections' },
        { table: 'website_section_versions', min: 0, name: 'Section Versions' },
        { table: 'website_section_permissions', min: 0, name: 'Section Permissions' },
        { table: 'website_case_studies', min: 0, name: 'Case Studies' },
        { table: 'website_case_study_settings', min: 0, name: 'Case Study Settings' },
        { table: 'website_testimonials', min: 0, name: 'Testimonials' },
        { table: 'website_testimonial_tokens', min: 0, name: 'Testimonial Tokens' },
        { table: 'website_testimonial_submissions', min: 0, name: 'Testimonial Submissions' },
        { table: 'website_design_guidelines', min: 0, name: 'Design Guidelines' }
    ]

    let all_passed = true

    for (const check of checks) {
        // We use .select('*', { count: 'exact', head: true }) to get count
        // But since we are likely ANON, we might see 0 if RLS blocks.
        // However, website_sections has "Public read enabled sections" policy.
        // website_settings has "Public read settings".
        // So we SHOULD see the data.

        const { count, error } = await supabase.from(check.table).select('*', { count: 'exact', head: true })

        if (error) {
            console.error(`❌ Check Failed for ${check.name}: ${error.message}`)
            all_passed = false
        } else {
            if (count === null || count < check.min) {
                console.error(`❌ Count Mismatch for ${check.name}: Expected >= ${check.min}, Got ${count}`)
                all_passed = false
            } else {
                console.log(`✅ ${check.name}: Found ${count} rows.`)
            }
        }
    }

    // RLS Write Check
    console.log('Testing RLS Security (Anon Write)...');
    const { error: insertError } = await supabase.from('website_sections').insert({
        slug: 'test-hack-v2',
        title: 'Hacked Section',
        sort_order: 999
    })

    if (insertError) {
        // We expect an error. 
        console.log(`✅ RLS Verified (Blocked Write): ${insertError.message}`)
    } else {
        console.error('❌ RLS FAILED: Anon user was able to insert data!')
        all_passed = false
    }

    if (!all_passed) {
        console.error('FAILED: One or more checks failed.')
        process.exit(1)
    }
}

verify()
