import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is missing!");
    process.exit(1);
  }
  const sql = neon(url);
  console.log("Adding googleSheetUrl to siteContent table...");

  await sql`
    ALTER TABLE "siteContent"
    ADD COLUMN IF NOT EXISTS "googleSheetUrl" text DEFAULT '';
  `;

  console.log("Successfully migrated googleSheetUrl column!");
  process.exit(0);
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
