export interface EnquiryData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
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
      name: data.name,
      email: data.email,
      phone: data.phone,
      projectType: data.projectType,
      message: data.message,
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
