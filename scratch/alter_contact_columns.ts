import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
async function run() {
  try {
    await sql`ALTER TABLE "siteContent" ALTER COLUMN "phone" TYPE text;`;
    await sql`ALTER TABLE "siteContent" ALTER COLUMN "whatsapp" TYPE text;`;
    await sql`ALTER TABLE "siteContent" ALTER COLUMN "email" TYPE text;`;
    console.log('COLUMNS_CONVERTED_SUCCESSFULLY');
  } catch (err) {
    console.error('Migration error:', err);
  }
}
run();
