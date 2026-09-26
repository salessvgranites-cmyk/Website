import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL!;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  console.log("Full GET response:\n", text);
}

main();
