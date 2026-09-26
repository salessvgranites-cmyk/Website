import "dotenv/config";
import { getDb } from "../server/db";
import { enquiries } from "../drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) process.exit(1);

  await db.insert(enquiries).values([
    {
      name: "Marcus Vance",
      email: "m.vance@stoneimports.eu",
      phone: "+44 7911 123456",
      projectType: "Monument Headstones (Export)",
      message: "Looking for 2x 20ft containers of polished Indian Black granite headstones for the European market. Please send current FOB pricing.",
      status: "new",
      createdAt: new Date(),
    },
    {
      name: "Elena Rostova",
      email: "elena@archstone.de",
      phone: "+49 30 901820",
      projectType: "Flamed Granite Slabs",
      message: "Need specifications and test certificates for flamed steel grey granite slabs 30mm thickness for outdoor plaza paving.",
      status: "in-progress",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    }
  ]);

  console.log("Seeded 2 test enquiries!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
