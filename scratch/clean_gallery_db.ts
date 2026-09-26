import dotenv from "dotenv";
dotenv.config();

import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log("Cleaning up gallery table text data (title, location, year)...");
  await sql`UPDATE "gallery" SET "title" = '', "location" = '', "year" = '';`;
  const items = await sql`SELECT "id", "imageUrl", "title", "location", "year", "sortOrder", "isVisible" FROM "gallery" ORDER BY "sortOrder" LIMIT 5;`;
  console.log("Updated gallery sample rows:", items);
  console.log("Successfully wiped all text data in gallery table!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
