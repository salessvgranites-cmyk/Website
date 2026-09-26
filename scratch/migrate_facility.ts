import { sql } from "drizzle-orm";
import { getDb } from "../server/db";

async function run() {
  const db = await getDb();
  if (!db) {
    console.error("No DB connection");
    process.exit(1);
  }
  console.log("Adding facility and banner columns to siteContent...");
  const statements = [
    sql`ALTER TABLE "siteContent" ADD COLUMN IF NOT EXISTS "facilityImage1" text DEFAULT '/images/hero-quarry.jpg'`,
    sql`ALTER TABLE "siteContent" ADD COLUMN IF NOT EXISTS "facilityImage2" text DEFAULT '/images/craft-cutting.jpg'`,
    sql`ALTER TABLE "siteContent" ADD COLUMN IF NOT EXISTS "facilityImage3" text DEFAULT '/images/slabs-warehouse.jpg'`,
    sql`ALTER TABLE "siteContent" ADD COLUMN IF NOT EXISTS "facilityImage4" text DEFAULT '/images/monument-headstone.jpg'`,
    sql`ALTER TABLE "siteContent" ADD COLUMN IF NOT EXISTS "facilityImage5" text DEFAULT '/images/vases-collection.jpg'`,
    sql`ALTER TABLE "siteContent" ADD COLUMN IF NOT EXISTS "facilityTitle" varchar(240) DEFAULT 'From Quarry to Container'`,
    sql`ALTER TABLE "siteContent" ADD COLUMN IF NOT EXISTS "facilityCopy" text DEFAULT 'A state-of-the-art facility with advanced machinery and a skilled team, ensuring precision at every stage.'`,
    sql`ALTER TABLE "siteContent" ADD COLUMN IF NOT EXISTS "bannerImage" text DEFAULT '/images/monument-headstone.jpg'`,
    sql`UPDATE "siteContent" SET
      "facilityImage1" = COALESCE("facilityImage1", '/images/hero-quarry.jpg'),
      "facilityImage2" = COALESCE("facilityImage2", '/images/craft-cutting.jpg'),
      "facilityImage3" = COALESCE("facilityImage3", '/images/slabs-warehouse.jpg'),
      "facilityImage4" = COALESCE("facilityImage4", '/images/monument-headstone.jpg'),
      "facilityImage5" = COALESCE("facilityImage5", '/images/vases-collection.jpg'),
      "facilityTitle" = COALESCE("facilityTitle", 'From Quarry to Container'),
      "facilityCopy" = COALESCE("facilityCopy", 'A state-of-the-art facility with advanced machinery and a skilled team, ensuring precision at every stage.'),
      "bannerImage" = COALESCE("bannerImage", '/images/monument-headstone.jpg')`
  ];

  for (const stmt of statements) {
    await db.execute(stmt);
  }

  console.log("Migration finished successfully!");
  process.exit(0);
}

run().catch(err => {
  console.error("Error during migration:", err);
  process.exit(1);
});
