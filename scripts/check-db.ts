import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
    console.log("Listing all published versions...")
    try {
        const { data: versions, error } = await supabase
            .from('website_section_versions')
            .select('id, section_id, status, created_at')
            .eq('status', 'published')

        if (error) {
            console.log("Error:", error.code, error.message)
        } else {
            console.log("Published Versions Count:", versions?.length)
            versions?.forEach(v => {
                console.log(`- ID: ${v.id}, SectionID: ${v.section_id}, Created: ${v.created_at}`)
            })
        }

        console.log("\nListing all sections...")
        const { data: sections, error: sErr } = await supabase
            .from('website_sections')
            .select('id, slug')

        if (sErr) {
            console.log("Error:", sErr.code, sErr.message)
        } else {
            console.log("Sections count:", sections?.length)
            sections?.forEach(s => {
                console.log(`- Slug: ${s.slug}, ID: ${s.id}`)
            })
        }
    } catch (e) {
        console.error("Caught exception:", e)
    }
}

testQuery()
