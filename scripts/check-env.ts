
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('Checking for DATABASE_URL...')
if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL found.')
} else if (process.env.POSTGRES_URL) {
    console.log('✅ POSTGRES_URL found.')
} else {
    console.error('❌ DATABASE_URL (or POSTGRES_URL) NOT found in .env.local')
    // List what IS there (keys only)
    console.log('Available Keys:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC') || k.includes('DB') || k.includes('URL')))
}
