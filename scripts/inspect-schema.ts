
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function inspectSchema() {
    console.log('🔍 Inspecting `clients` table schema...')

    // Attempt to insert a dummy row to trigger a column error or just select one row
    // A better way is to query information_schema if possible, but often RLS blocks it.
    // Let's try to get one row and see keys.
    const { data, error } = await supabase.from('clients').select('*').limit(1)

    if (error) {
        console.error('Error selecting from clients:', error)
    } else {
        if (data && data.length > 0) {
            console.log('✅ Columns found in existing row:', Object.keys(data[0]))
        } else {
            console.log('⚠️ No data found in `clients`. Attempting to infer columns from error or information_schema hack.')
            // Validating user claim about 'legal_name', 'lifecycle_stage'
            const { error: insertError } = await supabase.from('clients').select('legal_name, lifecycle_stage, email, first_name, last_name, name, website, website_url').limit(1)

            if (insertError) {
                console.log('Column check result:', insertError.message)
            } else {
                console.log('✅ Confirmed existence of queried columns (or some of them).')
            }
        }
    }
}

inspectSchema()
