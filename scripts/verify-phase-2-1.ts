
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verify() {
    console.log('🧪 Verifying Phase 2.1...')

    // 1. Check Case Studies (Dynamic)
    console.log('1️⃣  Checking Case Studies in DB...')
    const { data: casestudies, error: csError } = await supabase.from('website_case_studies').select('*').limit(1)
    if (csError || !casestudies.length) {
        console.error('❌ Case Studies missing or error', csError)
    } else {
        console.log(`✅ Found ${casestudies.length} case studies (Dynamic Content Ready).`)
    }

    // 2. Check Testimonials (Dynamic)
    console.log('2️⃣  Checking Testimonials in DB...')
    const { data: testimonials, error: tError } = await supabase.from('website_testimonials').select('*').limit(1)
    if (tError || !testimonials.length) {
        console.error('❌ Testimonials missing or error', tError)
    } else {
        console.log(`✅ Found ${testimonials.length} testimonials (Dynamic Content Ready).`)
    }

    // 3. Check Clients (Leads)
    console.log('3️⃣  Checking Clients Table schema...')
    const { data: clientData, error: cError } = await supabase.from('clients').select('email').limit(1)
    if (cError) {
        // If column doesn't exist, it will error
        if (cError.message.includes('email')) {
            console.error('❌ Email column MISSING in clients table!')
        } else {
            console.error('❌ Client table check failed:', cError.message)
        }
    } else {
        console.log('✅ Email column exists in clients table.')
    }

    console.log('✅ Verification Script Complete. Manual Browser verification required for animations and form submission.')
}

verify()
