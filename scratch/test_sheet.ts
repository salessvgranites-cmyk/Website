import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL!;
  
  // Test GET with query params like ?action=get or ?action=read
  for (const action of ["read", "get", "fetch", "all", "rows", "data"]) {
    try {
      const res = await fetch(`${url}?action=${action}`, { redirect: "follow" });
      const text = await res.text();
      console.log(`GET ?action=${action}: status=${res.status}, isJson=${text.startsWith("{") || text.startsWith("[")}, len=${text.length}`);
      if (text.length < 500 && (text.startsWith("{") || text.startsWith("["))) {
        console.log(`Response:`, text);
      }
    } catch (e: any) {
      console.log(`GET ${action} error:`, e.message);
    }
  }

  // Test POST with various action payloads
  for (const action of ["read", "get", "fetch", "getAll", "list"]) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
        redirect: "follow",
      });
      const text = await res.text();
      console.log(`POST action=${action}: status=${res.status}, response=${text.slice(0, 200)}`);
    } catch (e: any) {
      console.log(`POST ${action} error:`, e.message);
    }
  }
}

main();
