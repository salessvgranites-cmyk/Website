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
  console.log("Adding Why SV Granites 6 points columns to siteContent table...");

  await sql`
    ALTER TABLE "siteContent"
    ADD COLUMN IF NOT EXISTS "whyFeature1Title" text DEFAULT 'Direct Manufacturing',
    ADD COLUMN IF NOT EXISTS "whyFeature1Desc" text DEFAULT 'Work directly with the source.',
    ADD COLUMN IF NOT EXISTS "whyFeature2Title" text DEFAULT 'Consistent Quality',
    ADD COLUMN IF NOT EXISTS "whyFeature2Desc" text DEFAULT 'Material and finish checked before dispatch.',
    ADD COLUMN IF NOT EXISTS "whyFeature3Title" text DEFAULT 'Custom Production',
    ADD COLUMN IF NOT EXISTS "whyFeature3Desc" text DEFAULT 'Tailored to your requirements.',
    ADD COLUMN IF NOT EXISTS "whyFeature4Title" text DEFAULT 'Export Packaging',
    ADD COLUMN IF NOT EXISTS "whyFeature4Desc" text DEFAULT 'Safe for international transport.',
    ADD COLUMN IF NOT EXISTS "whyFeature5Title" text DEFAULT 'Responsive Communication',
    ADD COLUMN IF NOT EXISTS "whyFeature5Desc" text DEFAULT 'Clear coordination from enquiry to shipment.',
    ADD COLUMN IF NOT EXISTS "whyFeature6Title" text DEFAULT 'Long-Term Partnerships',
    ADD COLUMN IF NOT EXISTS "whyFeature6Desc" text DEFAULT 'Built on trust and reliability.';
  `;

  await sql`
    UPDATE "siteContent"
    SET
      "whyFeature1Title" = COALESCE("whyFeature1Title", 'Direct Manufacturing'),
      "whyFeature1Desc" = COALESCE("whyFeature1Desc", 'Work directly with the source.'),
      "whyFeature2Title" = COALESCE("whyFeature2Title", 'Consistent Quality'),
      "whyFeature2Desc" = COALESCE("whyFeature2Desc", 'Material and finish checked before dispatch.'),
      "whyFeature3Title" = COALESCE("whyFeature3Title", 'Custom Production'),
      "whyFeature3Desc" = COALESCE("whyFeature3Desc", 'Tailored to your requirements.'),
      "whyFeature4Title" = COALESCE("whyFeature4Title", 'Export Packaging'),
      "whyFeature4Desc" = COALESCE("whyFeature4Desc", 'Safe for international transport.'),
      "whyFeature5Title" = COALESCE("whyFeature5Title", 'Responsive Communication'),
      "whyFeature5Desc" = COALESCE("whyFeature5Desc", 'Clear coordination from enquiry to shipment.'),
      "whyFeature6Title" = COALESCE("whyFeature6Title", 'Long-Term Partnerships'),
      "whyFeature6Desc" = COALESCE("whyFeature6Desc", 'Built on trust and reliability.');
  `;

  console.log("Successfully migrated 6 Why SV Granites feature points!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
