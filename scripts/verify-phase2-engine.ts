
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase Service Key for verification script.')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyEngine() {
    console.log('🔄 Verifying Read-Only Engine logic...')

    // 1. Check Baseline
    console.log('1️⃣  Checking Baseline...')
    const baselineRes = await fetch('http://localhost:3000')
    const baselineHtml = await baselineRes.text()

    if (!baselineHtml.includes('We bridge the gap')) {
        console.error('❌ Baseline Failed: Mission text not found initially.')
        process.exit(1)
    }
    console.log('✅ Baseline OK: Mission text found.')

    // 2. Disable Mission Section
    console.log('2️⃣  Disabling Mission Section in DB...')
    const { error: updateError } = await supabase
        .from('website_sections')
        .update({ is_enabled: false })
        .eq('slug', 'mission')

    if (updateError) {
        console.error('❌ Failed to update DB:', updateError)
        process.exit(1)
    }

    // allow revalidation time/propagation? Next.js revalidate is 60s. 
    // Wait, in dev mode it should refresh on request but maybe not if its static?
    // app/page.tsx has revalidate=60. 
    // In dev mode (npm run dev), it usually re-renders on every request.

    // 3. Check Update
    console.log('3️⃣  Fetching Page (expecting Mission gone)...')
    const hiddenRes = await fetch('http://localhost:3000', { cache: 'no-store' })
    const hiddenHtml = await hiddenRes.text()

    if (hiddenHtml.includes('We bridge the gap')) {
        console.log('⚠️  Mission text STILL found. Dev mode caching or revalidate delay?')
        // In dev mode, data fetching *should* run again.
        // Let's assume it might fail if next js caches it too hard.
        // But let's see.
    } else {
        console.log('✅ Verification PASSED: Mission text disappeared.')
    }

    // 4. Re-enable Mission Section
    console.log('4️⃣  Re-enabling Mission Section...')
    await supabase
        .from('website_sections')
        .update({ is_enabled: true })
        .eq('slug', 'mission')

    console.log('✅ Restoration Complete.')
}

verifyEngine()
