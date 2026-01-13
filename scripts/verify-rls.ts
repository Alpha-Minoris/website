import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// 1. Create ANONYMOUS client (public user)
const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 2. Create SERVICE ROLE client (admin override check, usually testing bypass, 
//    but to test RLS effectively we essentially need to check what 'anon' CANNOT do)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyRLS() {
    console.log('Verifying RLS Policies...');
    let passed = true;

    // TEST 1: Public Read Web Settings (Should Succeed)
    const { data: settings, error: readError } = await supabaseAnon
        .from('web_settings')
        .select('*');

    if (readError) {
        console.error('❌ Public read web_settings FAILED:', readError.message);
        passed = false;
    } else {
        console.log('✅ Public read web_settings SUCCESS. Found rows:', settings.length);
    }

    // TEST 2: Public Write Web Settings (Should FAIL)
    const { error: writeError } = await supabaseAnon
        .from('web_settings')
        .insert({ theme_json: {}, brand_json: {} });

    if (writeError) {
        console.log('✅ Public write web_settings FAILED (Expected):', writeError.message);
    } else {
        // Note: Supabase/PostgREST RLS policy violation on INSERT usually returns an error 
        // "new row violates row-level security policy for table..."
        console.error('❌ Public write web_settings SUCCEEDED (UNEXPECTED). RLS is broken!');
        passed = false;
    }

    // TEST 3: Public Read Disabled Section (Assuming we have enabled ones, let's just check filtering)
    // We seeded sections as enabled=true.
    // If we try to read, we should see them.
    const { data: sections } = await supabaseAnon.from('web_sections').select('*');
    console.log('ℹ️ Public found enabled sections:', sections?.length);

    // TEST 4: Service Role Write (Should Succeed)
    // We'll insert a dummy section via admin to confirm DB is writable
    /*
    const { error: adminWriteError } = await supabaseAdmin.from('web_sections').insert({
      slug: 'test-admin-section',
      title: 'Admin Test',
      sort_order: 999,
      is_enabled: false
    });
    if (adminWriteError) {
        console.error('❌ Service Role write FAILED:', adminWriteError.message);
        passed = false;
    } else {
        console.log('✅ Service Role write SUCCESS.');
        // Cleanup
        await supabaseAdmin.from('web_sections').delete().eq('slug', 'test-admin-section');
    }
    */

    if (passed) {
        console.log('🎉 RLS Verification Passed!');
        process.exit(0);
    } else {
        console.error('💥 RLS Verification Failed!');
        process.exit(1);
    }
}

verifyRLS();
