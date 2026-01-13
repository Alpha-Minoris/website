require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectDB() {
    console.log("Checking connectivity...");

    // List all tables in public schema
    const { data: tables, error: tableError } = await supabase
        .rpc('get_tables_info'); // Assuming we don't have a direct helper, valid approach is usually selecting from information_schema via SQL editor, but via JS client we might need to use PostgREST if permissions allow, or just Try to select from 'users'.
    // Since we can't run arbitrary SQL easily without a helper function in DB, we will try to list known tables if possible or just select * from users limit 1.
    // Actually, asking for information_schema via standard client often fails due to permissions.
    // But we have SERVICE_ROLE_KEY.

    // Let's try select from 'users'
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (userError) {
        console.error("Error accessing 'users' table:", userError.message);
    } else {
        console.log("Successfully accessed 'users'. found rows:", users.length);
        if (users.length > 0) console.log("Sample user keys:", Object.keys(users[0]));
    }

    // Check for existing web_ tables
    // We can't list all tables easily via client-js unless we have a stored procedure. 
    // We'll rely on the user's statement for now and just check 'users'.
    // NOTE: 'users' table usually refers to auth.users in Supabase, but user said "there is already a users table there".
    // It might be in 'public' schema.
}

inspectDB();
