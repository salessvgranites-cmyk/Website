import dotenv from "dotenv";
dotenv.config();

import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log("Adding mapsUrl column to siteContent if not exists...");
  await sql`ALTER TABLE "siteContent" ADD COLUMN IF NOT EXISTS "mapsUrl" text DEFAULT '';`;
  console.log("Successfully migrated siteContent.mapsUrl!");
  const res = await sql`SELECT "id", "brandName", "address", "mapsUrl" FROM "siteContent" LIMIT 1;`;
  console.log("Current row:", res);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
