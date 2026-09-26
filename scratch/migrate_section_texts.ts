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
  console.log("Adding section text columns to siteContent table...");

  await sql`
    ALTER TABLE "siteContent"
    ADD COLUMN IF NOT EXISTS "productsEyebrow" text DEFAULT 'OUR PRODUCTS',
    ADD COLUMN IF NOT EXISTS "productsTitle" text DEFAULT 'Crafted for Lasting Impressions',
    ADD COLUMN IF NOT EXISTS "productsCopy" text DEFAULT 'From monumental structures to elegant accessories, our granite products are designed to meet the highest standards of quality and durability.',
    ADD COLUMN IF NOT EXISTS "collectionsEyebrow" text DEFAULT 'STONE COLLECTION',
    ADD COLUMN IF NOT EXISTS "collectionsTitle" text DEFAULT 'Nature''s Beauty. In Every Shade.',
    ADD COLUMN IF NOT EXISTS "collectionsCopy" text DEFAULT 'Explore our premium range of granite stones, known for their unique patterns, colours and durability.',
    ADD COLUMN IF NOT EXISTS "finishesEyebrow" text DEFAULT 'SURFACE FINISHINGS',
    ADD COLUMN IF NOT EXISTS "finishesTitle" text DEFAULT 'The Art of Every Surface.',
    ADD COLUMN IF NOT EXISTS "finishesCopy" text DEFAULT 'From mirror-polished luxury to rugged flamed textures — each finish transforms stone into a distinct architectural statement.',
    ADD COLUMN IF NOT EXISTS "whyChooseEyebrow" text DEFAULT 'WHY SV GRANITES',
    ADD COLUMN IF NOT EXISTS "whyChooseTitle" text DEFAULT 'The Right Partner for Your Stone Needs.',
    ADD COLUMN IF NOT EXISTS "globalReachEyebrow" text DEFAULT 'GLOBAL REACH',
    ADD COLUMN IF NOT EXISTS "globalReachTitle" text DEFAULT 'FROM INDIA, MADE FOR THE WORLD.',
    ADD COLUMN IF NOT EXISTS "globalReachCopy" text DEFAULT 'Manufactured in South India · Prepared for international buyers.',
    ADD COLUMN IF NOT EXISTS "galleryEyebrow" text DEFAULT 'GALLERY',
    ADD COLUMN IF NOT EXISTS "galleryTitle" text DEFAULT 'Stone in Every Frame.',
    ADD COLUMN IF NOT EXISTS "enquiryTitle" text DEFAULT 'LOOKING FOR THE RIGHT STONE?',
    ADD COLUMN IF NOT EXISTS "enquiryCopy" text DEFAULT 'Tell us what you''re looking for. We''ll help you find the right material, finish and specification.',
    ADD COLUMN IF NOT EXISTS "bannerTitle" text DEFAULT 'STONE THAT LASTS. PARTNERSHIPS THAT GROW.',
    ADD COLUMN IF NOT EXISTS "bannerSubtitle" text DEFAULT 'South India · India',
    ADD COLUMN IF NOT EXISTS "metric1Val" text DEFAULT '25+',
    ADD COLUMN IF NOT EXISTS "metric1Label" text DEFAULT 'Years of Experience',
    ADD COLUMN IF NOT EXISTS "metric2Val" text DEFAULT 'Export Ready',
    ADD COLUMN IF NOT EXISTS "metric2Label" text DEFAULT 'International Packaging',
    ADD COLUMN IF NOT EXISTS "metric3Val" text DEFAULT 'Quality Focused',
    ADD COLUMN IF NOT EXISTS "metric3Label" text DEFAULT 'Every Order Inspected',
    ADD COLUMN IF NOT EXISTS "metric4Val" text DEFAULT 'Direct Manufacturer',
    ADD COLUMN IF NOT EXISTS "metric4Label" text DEFAULT 'From India',
    ADD COLUMN IF NOT EXISTS "footerCopy" text DEFAULT 'All rights reserved.';
  `;

  // Also populate any null values in existing rows with the defaults
  await sql`
    UPDATE "siteContent"
    SET
      "productsEyebrow" = COALESCE("productsEyebrow", 'OUR PRODUCTS'),
      "productsTitle" = COALESCE("productsTitle", 'Crafted for Lasting Impressions'),
      "productsCopy" = COALESCE("productsCopy", 'From monumental structures to elegant accessories, our granite products are designed to meet the highest standards of quality and durability.'),
      "collectionsEyebrow" = COALESCE("collectionsEyebrow", 'STONE COLLECTION'),
      "collectionsTitle" = COALESCE("collectionsTitle", 'Nature''s Beauty. In Every Shade.'),
      "collectionsCopy" = COALESCE("collectionsCopy", 'Explore our premium range of granite stones, known for their unique patterns, colours and durability.'),
      "finishesEyebrow" = COALESCE("finishesEyebrow", 'SURFACE FINISHINGS'),
      "finishesTitle" = COALESCE("finishesTitle", 'The Art of Every Surface.'),
      "finishesCopy" = COALESCE("finishesCopy", 'From mirror-polished luxury to rugged flamed textures — each finish transforms stone into a distinct architectural statement.'),
      "whyChooseEyebrow" = COALESCE("whyChooseEyebrow", 'WHY SV GRANITES'),
      "whyChooseTitle" = COALESCE("whyChooseTitle", 'The Right Partner for Your Stone Needs.'),
      "globalReachEyebrow" = COALESCE("globalReachEyebrow", 'GLOBAL REACH'),
      "globalReachTitle" = COALESCE("globalReachTitle", 'FROM INDIA, MADE FOR THE WORLD.'),
      "globalReachCopy" = COALESCE("globalReachCopy", 'Manufactured in South India · Prepared for international buyers.'),
      "galleryEyebrow" = COALESCE("galleryEyebrow", 'GALLERY'),
      "galleryTitle" = COALESCE("galleryTitle", 'Stone in Every Frame.'),
      "enquiryTitle" = COALESCE("enquiryTitle", 'LOOKING FOR THE RIGHT STONE?'),
      "enquiryCopy" = COALESCE("enquiryCopy", 'Tell us what you''re looking for. We''ll help you find the right material, finish and specification.'),
      "bannerTitle" = COALESCE("bannerTitle", 'STONE THAT LASTS. PARTNERSHIPS THAT GROW.'),
      "bannerSubtitle" = COALESCE("bannerSubtitle", 'South India · India'),
      "metric1Val" = COALESCE("metric1Val", '25+'),
      "metric1Label" = COALESCE("metric1Label", 'Years of Experience'),
      "metric2Val" = COALESCE("metric2Val", 'Export Ready'),
      "metric2Label" = COALESCE("metric2Label", 'International Packaging'),
      "metric3Val" = COALESCE("metric3Val", 'Quality Focused'),
      "metric3Label" = COALESCE("metric3Label", 'Every Order Inspected'),
      "metric4Val" = COALESCE("metric4Val", 'Direct Manufacturer'),
      "metric4Label" = COALESCE("metric4Label", 'From India'),
      "footerCopy" = COALESCE("footerCopy", 'All rights reserved.');
  `;

  console.log("Migration completed successfully!");
}

main().catch(console.error);
