import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function repairSections() {
    console.log("Starting Section Repair...")

    // 1. Get all sections
    const { data: sections, error } = await supabase
        .from('website_sections')
        .select('*')

    if (error) {
        console.error("Error fetching sections:", error)
        return
    }

    console.log(`Found ${sections.length} sections. Checking for missing versions...`)

    for (const section of sections) {
        if (!section.published_version_id) {
            console.log(`[REPAIR] Section '${section.slug}' (${section.id}) has NO published_version_id. Repairing...`)

            // Create a new version
            const newVersion = {
                section_id: section.id,
                status: 'published',
                layout_json: {}, // Empty layout, let frontend use defaults
                content_html: '',
                is_locked: false
            }

            const { data: vData, error: vError } = await supabase
                .from('website_section_versions')
                .insert(newVersion)
                .select()
                .single()

            if (vError) {
                console.error(`[REPAIR] Failed to create version for ${section.slug}:`, vError)
                continue
            }

            console.log(`[REPAIR] Created new version ${vData.id} for ${section.slug}. Updating section...`)

            // Update section
            const { error: sError } = await supabase
                .from('website_sections')
                .update({ published_version_id: vData.id })
                .eq('id', section.id)

            if (sError) {
                console.error(`[REPAIR] Failed to update section ${section.slug}:`, sError)
            } else {
                console.log(`[REPAIR] Successfully repaired section ${section.slug}.`)
            }

        } else {
            // Optional: Check if the version actually exists?
            const { data: vExists } = await supabase
                .from('website_section_versions')
                .select('id')
                .eq('id', section.published_version_id)
                .single()

            if (!vExists) {
                console.log(`[REPAIR] Section '${section.slug}' points to non-existent version ${section.published_version_id}. Repairing...`)
                // Logic same as above
                // Create a new version
                const newVersion = {
                    section_id: section.id,
                    status: 'published',
                    layout_json: {},
                    content_html: '',
                    is_locked: false
                }

                const { data: vData, error: vError } = await supabase
                    .from('website_section_versions')
                    .insert(newVersion)
                    .select()
                    .single()

                if (vError) {
                    console.error(`[REPAIR] Failed to create version for ${section.slug}:`, vError)
                    continue
                }

                // Update section
                const { error: sError } = await supabase
                    .from('website_sections')
                    .update({ published_version_id: vData.id })
                    .eq('id', section.id)

                if (sError) {
                    console.error(`[REPAIR] Failed to update section ${section.slug}:`, sError)
                } else {
                    console.log(`[REPAIR] Successfully repaired section ${section.slug}.`)
                }
            } else {
                console.log(`[OK] Section '${section.slug}' is healthy.`)
            }
        }
    }
    console.log("Repair Complete.")
}

repairSections()
