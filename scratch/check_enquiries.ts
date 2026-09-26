import "dotenv/config";
import { getEnquiries } from "../server/db";

async function main() {
  const enquiries = await getEnquiries();
  console.log("Current enquiries in DB count:", enquiries.length);
  console.log("Enquiries:", enquiries);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
