export interface EnquiryData {
  id?: number;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  status?: string;
  createdAt?: Date | string;
}

/**
 * Sends enquiry details to a Google Sheets Webhook (Google Apps Script Web App).
 */
export async function appendEnquiryToGoogleSheet(data: EnquiryData): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.trim() === "") {
    console.log("[Google Sheets] Notice: GOOGLE_SHEETS_WEBHOOK_URL is not set in .env. Skipping Google Sheet update.");
    return false;
  }

  try {
    const payload = {
      action: "append",
      name: data.name,
      email: data.email,
      phone: data.phone,
      projectType: data.projectType,
      message: data.message,
      status: data.status || "new",
      timestamp: data.createdAt 
        ? new Date(data.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) 
        : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    // Google Apps Script requires redirect: 'follow'
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`[Google Sheets] Webhook request failed with status: ${response.status}`);
      return false;
    }

    console.log("[Google Sheets] Successfully forwarded enquiry to Google Sheet.");
    return true;
  } catch (error) {
    console.error("[Google Sheets] Failed to send enquiry to Google Sheet:", error);
    return false;
  }
}

let _supportsDeleteCache: { supported: boolean; timestamp: number } | null = null;

/**
 * Checks if the deployed Google Apps Script supports two-way operations (doGet / delete action).
 * If the old Apps Script is still running, GET returns HTML containing "Script function not found: doGet".
 */
export async function doesAppsScriptSupportDelete(): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.includes("script.google.com")) return false;

  if (_supportsDeleteCache && (Date.now() - _supportsDeleteCache.timestamp < 30000)) {
    return _supportsDeleteCache.supported;
  }

  try {
    const res = await fetch(webhookUrl, { method: "GET", redirect: "follow" });
    const text = await res.text();
    const isOldScript = text.includes("Script function not found") || text.includes("errorMessage");
    const isSupported = res.ok && !isOldScript;
    _supportsDeleteCache = { supported: isSupported, timestamp: Date.now() };
    return isSupported;
  } catch {
    return false;
  }
}

/**
 * Deletes an enquiry from Google Sheets via the Webhook action.
 * If the deployed script is still the old 1-way script, we skip calling it to prevent appendRow!
 */
export async function deleteEnquiryFromGoogleSheet(data: {
  id?: number;
  timestamp?: string | Date;
  name?: string;
  email?: string;
  phone?: string;
}): Promise<{ syncedToSheet: boolean; reason?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.trim() === "") {
    return { syncedToSheet: false, reason: "no_webhook_configured" };
  }

  // Safety check: Does the user's deployed script support delete action?
  const supportsDelete = await doesAppsScriptSupportDelete();
  if (!supportsDelete) {
    console.warn(
      "[Google Sheets] Notice: The currently deployed Google Apps Script does not have the 'delete' handler yet. Skipping webhook call to prevent appending a new row. Please update your Google Apps Script using the code in the Admin Setup Guide."
    );
    return { syncedToSheet: false, reason: "script_not_updated" };
  }

  try {
    const payload = {
      action: "delete",
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      timestamp: data.timestamp
        ? new Date(data.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        : undefined,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`[Google Sheets] Delete webhook failed with status: ${response.status}`);
      return { syncedToSheet: false, reason: `http_${response.status}` };
    }

    console.log("[Google Sheets] Successfully triggered delete in Google Sheet.");
    return { syncedToSheet: true };
  } catch (error: any) {
    console.error("[Google Sheets] Failed to trigger delete in Google Sheet:", error);
    return { syncedToSheet: false, reason: error.message };
  }
}

/**
 * Fetches enquiries from Google Sheet either via:
 * 1. Google Sheets CSV Export URL (if provided as a docs.google.com/spreadsheets link)
 * 2. Google Apps Script Webhook (GET / POST action: 'read')
 */
export async function fetchEnquiriesFromGoogleSheet(customUrl?: string): Promise<EnquiryData[]> {
  const targetUrl = (customUrl && customUrl.trim() !== "") 
    ? customUrl.trim() 
    : (process.env.GOOGLE_SHEET_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL);

  if (!targetUrl || targetUrl.trim() === "") {
    throw new Error("No Google Sheet or Webhook URL configured. Please check your settings or .env file.");
  }

  console.log(`[Google Sheets] Fetching enquiries from: ${targetUrl}`);

  // Option A: Direct Google Spreadsheet URL (e.g. https://docs.google.com/spreadsheets/d/XXXX/edit...)
  const sheetMatch = targetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetMatch && sheetMatch[1]) {
    const sheetId = sheetMatch[1];
    // CSV export URL works when sheet is "Anyone with link can view" or published to web
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const res = await fetch(csvUrl, { redirect: "follow" });
    if (!res.ok) {
      // Try gviz endpoint as fallback
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
      const gvizRes = await fetch(gvizUrl, { redirect: "follow" });
      if (!gvizRes.ok) {
        throw new Error(
          "Could not fetch spreadsheet CSV. Please ensure the Google Sheet is shared with 'Anyone with the link can view' or published to web."
        );
      }
      const csvText = await gvizRes.text();
      return parseCsvToEnquiries(csvText);
    }
    const csvText = await res.text();
    return parseCsvToEnquiries(csvText);
  }

  // Option B: Google Apps Script Webhook URL
  if (targetUrl.includes("script.google.com")) {
    // 1. Try GET
    try {
      const getRes = await fetch(targetUrl, { redirect: "follow" });
      if (getRes.ok) {
        const text = await getRes.text();
        if (text.trim().startsWith("[") || text.trim().startsWith("{")) {
          const parsed = JSON.parse(text);
          const list = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || []);
          if (Array.isArray(list) && list.length > 0) {
            return mapRawListToEnquiries(list);
          }
        }
      }
    } catch (e: any) {
      console.log(`[Google Sheets] Webhook GET attempt info:`, e.message);
    }

    // 2. Try POST action: "read"
    try {
      const postRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
        redirect: "follow",
      });
      if (postRes.ok) {
        const text = await postRes.text();
        if (text.trim().startsWith("[") || text.trim().startsWith("{")) {
          const parsed = JSON.parse(text);
          const list = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || []);
          if (Array.isArray(list) && list.length > 0) {
            return mapRawListToEnquiries(list);
          }
        }
      }
    } catch (e: any) {
      console.log(`[Google Sheets] Webhook POST attempt info:`, e.message);
    }

    throw new Error(
      "The Google Apps Script Webhook is active, but requires 'doGet' or 'read' action to fetch rows. Check the Google Apps Script setup guide in the admin panel."
    );
  }

  // Option C: Generic CSV link
  const res = await fetch(targetUrl, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet data. Status: ${res.status}`);
  }
  const text = await res.text();
  return parseCsvToEnquiries(text);
}

/**
 * Maps raw objects or array rows from Google Apps Script to EnquiryData items.
 */
function mapRawListToEnquiries(list: any[]): EnquiryData[] {
  const result: EnquiryData[] = [];

  // Check if first row is header array
  let startIndex = 0;
  let headers: string[] = [];

  if (Array.isArray(list[0])) {
    headers = list[0].map((h: any) => String(h).toLowerCase().trim());
    startIndex = 1;
  }

  for (let i = startIndex; i < list.length; i++) {
    const item = list[i];
    if (!item) continue;

    if (Array.isArray(item)) {
      if (item.every(val => !val || String(val).trim() === "")) continue;

      let name = "";
      let email = "";
      let phone = "";
      let projectType = "General Enquiry";
      let message = "";
      let status = "new";
      let createdAt: Date = new Date();

      item.forEach((val: any, idx: number) => {
        const h = headers[idx] || "";
        const strVal = String(val ?? "").trim();
        if (h.includes("time") || h.includes("date")) {
          createdAt = parseFlexibleDate(strVal);
        } else if (h.includes("name") || h.includes("client")) {
          name = strVal;
        } else if (h.includes("email") || strVal.includes("@")) {
          email = strVal;
        } else if (h.includes("phone") || h.includes("mobile") || h.includes("contact")) {
          phone = strVal;
        } else if (h.includes("project") || h.includes("type") || h.includes("category")) {
          projectType = strVal;
        } else if (h.includes("message") || h.includes("notes") || h.includes("query")) {
          message = strVal;
        } else if (h.includes("status")) {
          status = strVal.toLowerCase();
        } else if (idx === 0 && !name) {
          // If no headers, fallback positional mapping: [timestamp, name, email, phone, projectType, message, status]
          createdAt = parseFlexibleDate(strVal);
        } else if (idx === 1 && !name) {
          name = strVal;
        } else if (idx === 2 && !email) {
          email = strVal;
        } else if (idx === 3 && !phone) {
          phone = strVal;
        } else if (idx === 4 && (!projectType || projectType === "General Enquiry")) {
          projectType = strVal;
        } else if (idx === 5 && !message) {
          message = strVal;
        } else if (idx === 6 && status === "new") {
          status = strVal.toLowerCase();
        }
      });

      if (name || email || phone) {
        result.push({
          name: name || "Anonymous",
          email: email || "no-email@client.com",
          phone: phone || "Not provided",
          projectType: projectType || "General Enquiry",
          message: message || "No message provided",
          status: status === "closed" ? "closed" : status === "in-progress" ? "in-progress" : "new",
          createdAt,
        });
      }
    } else if (typeof item === "object") {
      const keys = Object.keys(item);
      let name = "";
      let email = "";
      let phone = "";
      let projectType = "General Enquiry";
      let message = "";
      let status = "new";
      let createdAt: Date = new Date();

      keys.forEach((k) => {
        const lk = k.toLowerCase().trim();
        const val = String(item[k] ?? "").trim();
        if (lk.includes("time") || lk.includes("date")) createdAt = parseFlexibleDate(val);
        else if (lk.includes("name") || lk.includes("client")) name = val;
        else if (lk.includes("email") || val.includes("@")) email = val;
        else if (lk.includes("phone") || lk.includes("mobile") || lk.includes("contact")) phone = val;
        else if (lk.includes("project") || lk.includes("type")) projectType = val;
        else if (lk.includes("message") || lk.includes("notes") || lk.includes("query")) message = val;
        else if (lk.includes("status")) status = val.toLowerCase();
      });

      if (name || email || phone) {
        result.push({
          name: name || "Anonymous",
          email: email || "no-email@client.com",
          phone: phone || "Not provided",
          projectType: projectType || "General Enquiry",
          message: message || "No message provided",
          status: status === "closed" ? "closed" : status === "in-progress" ? "in-progress" : "new",
          createdAt,
        });
      }
    }
  }

  return result;
}

/**
 * Parses raw CSV text into EnquiryData objects.
 */
function parseCsvToEnquiries(csvText: string): EnquiryData[] {
  const rows = parseCsvRows(csvText);
  if (rows.length <= 1) return [];
  return mapRawListToEnquiries(rows);
}

/**
 * Robust CSV parser that handles quotes, escaped quotes, commas, and multiline values.
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !insideQuote) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses a variety of date formats (ISO, DD/MM/YYYY, MM/DD/YYYY, timestamp strings)
 */
function parseFlexibleDate(dateStr: string): Date {
  if (!dateStr || dateStr.trim() === "") return new Date();

  // Try standard Date parsing
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(.*)$/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    const year = parseInt(parts[3], 10);
    const timePart = parts[4]?.trim();
    if (timePart) {
      const dt = new Date(`${year}-${month + 1}-${day} ${timePart}`);
      if (!isNaN(dt.getTime())) return dt;
    }
    return new Date(year, month, day);
  }

  return new Date();
}
