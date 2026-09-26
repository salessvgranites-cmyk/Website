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
  console.log("Adding whatsappTemplate, emailSubjectTemplate, emailBodyTemplate to siteContent table...");

  await sql`
    ALTER TABLE "siteContent"
    ADD COLUMN IF NOT EXISTS "whatsappTemplate" text DEFAULT 'Hello SV Granites, I visited your website and would like to enquire about your granite products and export pricing.',
    ADD COLUMN IF NOT EXISTS "emailSubjectTemplate" text DEFAULT 'Enquiry regarding Granite Products & Supply - SV Granites',
    ADD COLUMN IF NOT EXISTS "emailBodyTemplate" text DEFAULT 'Dear SV Granites Team,\n\nI visited your website and would like to enquire regarding your natural stone collection and pricing.\n\nProject details:\n\nThank you!';
  `;

  await sql`
    UPDATE "siteContent"
    SET
      "whatsappTemplate" = COALESCE("whatsappTemplate", 'Hello SV Granites, I visited your website and would like to enquire about your granite products and export pricing.'),
      "emailSubjectTemplate" = COALESCE("emailSubjectTemplate", 'Enquiry regarding Granite Products & Supply - SV Granites'),
      "emailBodyTemplate" = COALESCE("emailBodyTemplate", 'Dear SV Granites Team,\n\nI visited your website and would like to enquire regarding your natural stone collection and pricing.\n\nProject details:\n\nThank you!');
  `;

  console.log("Successfully migrated message templates columns!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
