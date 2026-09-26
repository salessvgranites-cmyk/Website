import "dotenv/config";
import { createEnquiry } from "../server/db";

async function main() {
  console.log("Testing single createEnquiry submission...");
  const result = await createEnquiry({
    name: "Single Test Client",
    email: "singletest@client.com",
    phone: "9876543210",
    projectType: "Granite Slabs",
    message: "Verifying single entry forwarding to Google Sheets",
    status: "new",
  });

  console.log("Enquiry created:", result);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
