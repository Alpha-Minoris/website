import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function applyMigrations() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not set.');
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected to database.');

        const migrationDir = path.join(process.cwd(), 'supabase', 'migrations');
        const files = fs.readdirSync(migrationDir).sort();

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Applying migration: ${file}`);
                const filePath = path.join(migrationDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                await client.query(sql);
                console.log(`Executed ${file} successfully.`);
            }
        }

        console.log('All migrations applied successfully.');
    } catch (err) {
        console.error('Error applying migrations:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigrations();
