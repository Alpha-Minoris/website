import { createClient } from '@supabase/supabase-js'
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DATABASE_URL = process.env.DATABASE_URL

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Supabase credentials (URL/Service Key) missing.')
    process.exit(1)
}

async function runMigration() {
    console.log('Initializing Supabase Admin Client...')
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Create Bucket via API (The most reliable way for bucket creation)
    console.log("Creating/Verifying 'site-assets' bucket...")
    const { data: bucket, error: bucketError } = await supabase
        .storage
        .createBucket('site-assets', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
        })

    if (bucketError) {
        if (bucketError.message.includes('already exists')) {
            console.log("Bucket 'site-assets' already exists.")
        } else {
            console.error("Error creating bucket:", bucketError)
        }
    } else {
        console.log("Bucket 'site-assets' created successfully.")
    }

    // 2. Run SQL for Policies (Hybrid approach)
    if (DATABASE_URL) {
        const client = new Client({
            connectionString: DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        })

        try {
            console.log('Connecting to database for RLS policies...')
            await client.connect()

            const sql = `
            -- Enable RLS
            ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

            -- Policies for site-assets bucket
            DROP POLICY IF EXISTS "Public Access" ON storage.objects;
            DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
            DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
            DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

            CREATE POLICY "Public Access"
            ON storage.objects FOR SELECT
            USING ( bucket_id = 'site-assets' );

            CREATE POLICY "Auth Upload"
            ON storage.objects FOR INSERT
            WITH CHECK (
              bucket_id = 'site-assets' AND
              auth.role() = 'authenticated'
            );

            CREATE POLICY "Auth Update"
            ON storage.objects FOR UPDATE
            USING (
              bucket_id = 'site-assets' AND
              auth.role() = 'authenticated'
            );

            CREATE POLICY "Auth Delete"
            ON storage.objects FOR DELETE
            USING (
              bucket_id = 'site-assets' AND
              auth.role() = 'authenticated'
            );
            `

            console.log('Applying SQL RLS policies...')
            await client.query(sql)
            console.log('SQL policies applied successfully!')

        } catch (err: any) {
            console.warn('Warning: Could not apply RLS policies via SQL. This is common if connecting via a pooler with limited permissions.')
            console.error('SQL Error Detail:', err.message)
            console.log('You may need to manually enable RLS and add policies for the "site-assets" bucket in the Supabase Dashboard.')
        } finally {
            await client.end()
        }
    } else {
        console.log('DATABASE_URL missing, skipping SQL policy application.')
    }
}

runMigration()
