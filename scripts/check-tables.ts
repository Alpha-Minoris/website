
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function listTables() {
    console.log('🔍 Listing tables in public schema...')
    // We can't easily list tables with supabase-js easily without a function or querying information_schema if permissions allow.
    // But we can try to "select" from likely candidates.

    const candidates = ['clients', 'website_clients', 'leads', 'website_leads', 'customers', 'website_customers']

    for (const table of candidates) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
        if (!error) {
            console.log(`✅ Found table: ${table}`)
        } else {
            // 42P01 is undefined_table
            if (error.code !== '42P01') {
                console.log(`❓ Table ${table} exists but error: ${error.code} - ${error.message}`)
            }
        }
    }
}

listTables()
