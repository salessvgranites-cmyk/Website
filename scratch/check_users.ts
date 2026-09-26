import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
async function run() {
  const users = await sql`SELECT * FROM "users";`;
  console.log('ALL_USERS:', JSON.stringify(users, null, 2));
}
run();
