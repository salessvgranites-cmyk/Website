// server/api/trpc/[trpc].ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// server/routers.ts
import { z as z2 } from "zod";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/cookies.ts
var LOCAL_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1"]);
function isIpAddress(host) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function isLocalRequest(req) {
  const host = req.hostname ?? "";
  return LOCAL_HOSTS.has(host) || isIpAddress(host);
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  const isLocal = isLocalRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: isLocal ? "lax" : "none",
    secure: isLocal ? false : secure
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/db.ts
import { asc, desc, eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// drizzle/schema.ts
import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var siteContent = pgTable("siteContent", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  brandName: varchar("brandName", { length: 140 }).notNull(),
  tagline: varchar("tagline", { length: 240 }).notNull(),
  heroEyebrow: varchar("heroEyebrow", { length: 160 }).notNull(),
  heroTitle: varchar("heroTitle", { length: 240 }).notNull(),
  heroCopy: text("heroCopy").notNull(),
  aboutTitle: varchar("aboutTitle", { length: 180 }).notNull(),
  aboutCopy: text("aboutCopy").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  hours: varchar("hours", { length: 160 }).notNull(),
  heroImage: text("heroImage").notNull(),
  heroImage2: text("heroImage2").default("/images/hero-quarry.jpg"),
  aboutImage: text("aboutImage").notNull(),
  logoImage: text("logoImage").default("/images/logo.jpg"),
  heroSubtext: text("heroSubtext").default("Premium Indian granite products manufactured and prepared for international markets."),
  facilityImage1: text("facilityImage1").default("/images/hero-quarry.jpg"),
  facilityImage2: text("facilityImage2").default("/images/craft-cutting.jpg"),
  facilityImage3: text("facilityImage3").default("/images/slabs-warehouse.jpg"),
  facilityImage4: text("facilityImage4").default("/images/monument-headstone.jpg"),
  facilityImage5: text("facilityImage5").default("/images/vases-collection.jpg"),
  facilityTitle: varchar("facilityTitle", { length: 240 }).default("From Quarry to Container"),
  facilityCopy: text("facilityCopy").default("A state-of-the-art facility with advanced machinery and a skilled team, ensuring precision at every stage."),
  bannerImage: text("bannerImage").default("/images/monument-headstone.jpg"),
  mapsUrl: text("mapsUrl").default(""),
  googleSheetUrl: text("googleSheetUrl").default(""),
  productsEyebrow: text("productsEyebrow").default("OUR PRODUCTS"),
  productsTitle: text("productsTitle").default("Crafted for Lasting Impressions"),
  productsCopy: text("productsCopy").default("From monumental structures to elegant accessories, our granite products are designed to meet the highest standards of quality and durability."),
  collectionsEyebrow: text("collectionsEyebrow").default("STONE COLLECTION"),
  collectionsTitle: text("collectionsTitle").default("Nature's Beauty. In Every Shade."),
  collectionsCopy: text("collectionsCopy").default("Explore our premium range of granite stones, known for their unique patterns, colours and durability."),
  finishesEyebrow: text("finishesEyebrow").default("SURFACE FINISHINGS"),
  finishesTitle: text("finishesTitle").default("The Art of Every Surface."),
  finishesCopy: text("finishesCopy").default("From mirror-polished luxury to rugged flamed textures \u2014 each finish transforms stone into a distinct architectural statement."),
  whyChooseEyebrow: text("whyChooseEyebrow").default("WHY SV GRANITES"),
  whyChooseTitle: text("whyChooseTitle").default("The Right Partner for Your Stone Needs."),
  whyFeature1Title: text("whyFeature1Title").default("Direct Manufacturing"),
  whyFeature1Desc: text("whyFeature1Desc").default("Work directly with the source."),
  whyFeature2Title: text("whyFeature2Title").default("Consistent Quality"),
  whyFeature2Desc: text("whyFeature2Desc").default("Material and finish checked before dispatch."),
  whyFeature3Title: text("whyFeature3Title").default("Custom Production"),
  whyFeature3Desc: text("whyFeature3Desc").default("Tailored to your requirements."),
  whyFeature4Title: text("whyFeature4Title").default("Export Packaging"),
  whyFeature4Desc: text("whyFeature4Desc").default("Safe for international transport."),
  whyFeature5Title: text("whyFeature5Title").default("Responsive Communication"),
  whyFeature5Desc: text("whyFeature5Desc").default("Clear coordination from enquiry to shipment."),
  whyFeature6Title: text("whyFeature6Title").default("Long-Term Partnerships"),
  whyFeature6Desc: text("whyFeature6Desc").default("Built on trust and reliability."),
  globalReachEyebrow: text("globalReachEyebrow").default("GLOBAL REACH"),
  globalReachTitle: text("globalReachTitle").default("FROM INDIA, MADE FOR THE WORLD."),
  globalReachCopy: text("globalReachCopy").default("Manufactured in South India \xB7 Prepared for international buyers."),
  galleryEyebrow: text("galleryEyebrow").default("GALLERY"),
  galleryTitle: text("galleryTitle").default("Stone in Every Frame."),
  enquiryTitle: text("enquiryTitle").default("LOOKING FOR THE RIGHT STONE?"),
  enquiryCopy: text("enquiryCopy").default("Tell us what you're looking for. We'll help you find the right material, finish and specification."),
  bannerTitle: text("bannerTitle").default("STONE THAT LASTS. PARTNERSHIPS THAT GROW."),
  bannerSubtitle: text("bannerSubtitle").default("South India \xB7 India"),
  metric1Val: text("metric1Val").default("25+"),
  metric1Label: text("metric1Label").default("Years of Experience"),
  metric2Val: text("metric2Val").default("Export Ready"),
  metric2Label: text("metric2Label").default("International Packaging"),
  metric3Val: text("metric3Val").default("Quality Focused"),
  metric3Label: text("metric3Label").default("Every Order Inspected"),
  metric4Val: text("metric4Val").default("Direct Manufacturer"),
  metric4Label: text("metric4Label").default("From India"),
  footerCopy: text("footerCopy").default("All rights reserved."),
  whatsappTemplate: text("whatsappTemplate").default("Hello SV Granites, I visited your website and would like to enquire about your granite products and export pricing."),
  emailSubjectTemplate: text("emailSubjectTemplate").default("Enquiry regarding Granite Products & Supply - SV Granites"),
  emailBodyTemplate: text("emailBodyTemplate").default("Dear SV Granites Team,\n\nI visited your website and would like to enquire regarding your natural stone collection and pricing.\n\nProject details:\n\nThank you!"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var collections = pgTable("collections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description").notNull(),
  finish: varchar("finish", { length: 80 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  isFeatured: integer("isFeatured").default(1).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isVisible: integer("isVisible").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var gallery = pgTable("gallery", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 140 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  year: varchar("year", { length: 20 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isVisible: integer("isVisible").default(1).notNull()
});
var enquiries = pgTable("enquiries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 60 }).notNull(),
  projectType: varchar("projectType", { length: 100 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 30 }).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("imageUrl").notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isVisible: integer("isVisible").default(1).notNull()
});
var finishes = pgTable("finishes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  tagline: varchar("tagline", { length: 240 }).notNull(),
  description: text("description").notNull(),
  badge: varchar("badge", { length: 80 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isVisible: integer("isVisible").default(1).notNull()
});
var sectionVisibility = pgTable("sectionVisibility", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sectionKey: varchar("sectionKey", { length: 60 }).notNull().unique(),
  isVisible: integer("isVisible").default(1).notNull()
});

// server/googleSheets.ts
async function appendEnquiryToGoogleSheet(data) {
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
      timestamp: data.createdAt ? new Date(data.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : (/* @__PURE__ */ new Date()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    };
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      redirect: "follow"
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
var _supportsDeleteCache = null;
async function doesAppsScriptSupportDelete() {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.includes("script.google.com")) return false;
  if (_supportsDeleteCache && Date.now() - _supportsDeleteCache.timestamp < 3e4) {
    return _supportsDeleteCache.supported;
  }
  try {
    const res = await fetch(webhookUrl, { method: "GET", redirect: "follow" });
    const text2 = await res.text();
    const isOldScript = text2.includes("Script function not found") || text2.includes("errorMessage");
    const isSupported = res.ok && !isOldScript;
    _supportsDeleteCache = { supported: isSupported, timestamp: Date.now() };
    return isSupported;
  } catch {
    return false;
  }
}
async function deleteEnquiryFromGoogleSheet(data) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.trim() === "") {
    return { syncedToSheet: false, reason: "no_webhook_configured" };
  }
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
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : void 0
    };
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });
    if (!response.ok) {
      console.error(`[Google Sheets] Delete webhook failed with status: ${response.status}`);
      return { syncedToSheet: false, reason: `http_${response.status}` };
    }
    console.log("[Google Sheets] Successfully triggered delete in Google Sheet.");
    return { syncedToSheet: true };
  } catch (error) {
    console.error("[Google Sheets] Failed to trigger delete in Google Sheet:", error);
    return { syncedToSheet: false, reason: error.message };
  }
}
async function fetchEnquiriesFromGoogleSheet(customUrl) {
  const targetUrl = customUrl && customUrl.trim() !== "" ? customUrl.trim() : process.env.GOOGLE_SHEET_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!targetUrl || targetUrl.trim() === "") {
    throw new Error("No Google Sheet or Webhook URL configured. Please check your settings or .env file.");
  }
  console.log(`[Google Sheets] Fetching enquiries from: ${targetUrl}`);
  const sheetMatch = targetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetMatch && sheetMatch[1]) {
    const sheetId = sheetMatch[1];
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const res2 = await fetch(csvUrl, { redirect: "follow" });
    if (!res2.ok) {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
      const gvizRes = await fetch(gvizUrl, { redirect: "follow" });
      if (!gvizRes.ok) {
        throw new Error(
          "Could not fetch spreadsheet CSV. Please ensure the Google Sheet is shared with 'Anyone with the link can view' or published to web."
        );
      }
      const csvText2 = await gvizRes.text();
      return parseCsvToEnquiries(csvText2);
    }
    const csvText = await res2.text();
    return parseCsvToEnquiries(csvText);
  }
  if (targetUrl.includes("script.google.com")) {
    try {
      const getRes = await fetch(targetUrl, { redirect: "follow" });
      if (getRes.ok) {
        const text3 = await getRes.text();
        if (text3.trim().startsWith("[") || text3.trim().startsWith("{")) {
          const parsed = JSON.parse(text3);
          const list = Array.isArray(parsed) ? parsed : parsed.data || parsed.rows || [];
          if (Array.isArray(list) && list.length > 0) {
            return mapRawListToEnquiries(list);
          }
        }
      }
    } catch (e) {
      console.log(`[Google Sheets] Webhook GET attempt info:`, e.message);
    }
    try {
      const postRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
        redirect: "follow"
      });
      if (postRes.ok) {
        const text3 = await postRes.text();
        if (text3.trim().startsWith("[") || text3.trim().startsWith("{")) {
          const parsed = JSON.parse(text3);
          const list = Array.isArray(parsed) ? parsed : parsed.data || parsed.rows || [];
          if (Array.isArray(list) && list.length > 0) {
            return mapRawListToEnquiries(list);
          }
        }
      }
    } catch (e) {
      console.log(`[Google Sheets] Webhook POST attempt info:`, e.message);
    }
    throw new Error(
      "The Google Apps Script Webhook is active, but requires 'doGet' or 'read' action to fetch rows. Check the Google Apps Script setup guide in the admin panel."
    );
  }
  const res = await fetch(targetUrl, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet data. Status: ${res.status}`);
  }
  const text2 = await res.text();
  return parseCsvToEnquiries(text2);
}
function mapRawListToEnquiries(list) {
  const result = [];
  let startIndex = 0;
  let headers = [];
  if (Array.isArray(list[0])) {
    headers = list[0].map((h) => String(h).toLowerCase().trim());
    startIndex = 1;
  }
  for (let i = startIndex; i < list.length; i++) {
    const item = list[i];
    if (!item) continue;
    if (Array.isArray(item)) {
      if (item.every((val) => !val || String(val).trim() === "")) continue;
      let name = "";
      let email = "";
      let phone = "";
      let projectType = "General Enquiry";
      let message = "";
      let status = "new";
      let createdAt = /* @__PURE__ */ new Date();
      item.forEach((val, idx) => {
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
          createdAt
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
      let createdAt = /* @__PURE__ */ new Date();
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
          createdAt
        });
      }
    }
  }
  return result;
}
function parseCsvToEnquiries(csvText) {
  const rows = parseCsvRows(csvText);
  if (rows.length <= 1) return [];
  return mapRawListToEnquiries(rows);
}
function parseCsvRows(text2) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let insideQuote = false;
  for (let i = 0; i < text2.length; i++) {
    const char = text2[i];
    const nextChar = text2[i + 1];
    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !insideQuote) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((col) => col.length > 0)) {
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
    if (currentRow.some((col) => col.length > 0)) {
      rows.push(currentRow);
    }
  }
  return rows;
}
function parseFlexibleDate(dateStr) {
  if (!dateStr || dateStr.trim() === "") return /* @__PURE__ */ new Date();
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const parts = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(.*)$/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    const year = parseInt(parts[3], 10);
    const timePart = parts[4]?.trim();
    if (timePart) {
      const dt = /* @__PURE__ */ new Date(`${year}-${month + 1}-${day} ${timePart}`);
      if (!isNaN(dt.getTime())) return dt;
    }
    return new Date(year, month, day);
  }
  return /* @__PURE__ */ new Date();
}

// shared/contentDefaults.ts
var DEFAULT_CONTENT = {
  brandName: "Sri Venkateswara Granites",
  tagline: "Crafted by Nature. Perfected by Us.",
  heroEyebrow: "INDIAN GRANITE EXPORTER",
  heroTitle: "Sri Venkateswara Granites.",
  heroCopy: "Premium Indian granite products manufactured and prepared for international markets.",
  aboutTitle: "NATURE CREATES IT. WE PERFECT IT.",
  aboutCopy: "From raw granite selection to cutting, shaping, polishing, finishing and export packaging, every stage is handled with attention to detail.",
  phone: "9790613468",
  whatsapp: "9790613468",
  email: "sales.svgranites@gmail.com",
  address: "NO.951/3,Poovallikuppam Village Kadampathur Block, Post, Mappedu, Chennai, Tamil Nadu 602105",
  hours: "Mon\u2013Sat \xB7 9:30 AM \u2014 6:30 PM",
  heroImage: "/images/hero-quarry.jpg",
  heroImage2: "/images/hero-quarry.jpg",
  aboutImage: "/images/craft-cutting.jpg",
  logoImage: "/images/logo.jpg",
  heroSubtext: "Premium Indian granite products manufactured and prepared for international markets.",
  facilityImage1: "/images/hero-quarry.jpg",
  facilityImage2: "/images/craft-cutting.jpg",
  facilityImage3: "/images/slabs-warehouse.jpg",
  facilityImage4: "/images/monument-headstone.jpg",
  facilityImage5: "/images/vases-collection.jpg",
  facilityTitle: "From Quarry to Container",
  facilityCopy: "A state-of-the-art facility with advanced machinery and a skilled team, ensuring precision at every stage.",
  bannerImage: "/images/monument-headstone.jpg",
  mapsUrl: "",
  googleSheetUrl: "",
  productsEyebrow: "OUR PRODUCTS",
  productsTitle: "Crafted for Lasting Impressions",
  productsCopy: "From monumental structures to elegant accessories, our granite products are designed to meet the highest standards of quality and durability.",
  collectionsEyebrow: "STONE COLLECTION",
  collectionsTitle: "Nature's Beauty. In Every Shade.",
  collectionsCopy: "Explore our premium range of granite stones, known for their unique patterns, colours and durability.",
  finishesEyebrow: "SURFACE FINISHINGS",
  finishesTitle: "The Art of Every Surface.",
  finishesCopy: "From mirror-polished luxury to rugged flamed textures \u2014 each finish transforms stone into a distinct architectural statement.",
  whyChooseEyebrow: "WHY SV GRANITES",
  whyChooseTitle: "The Right Partner for Your Stone Needs.",
  whyFeature1Title: "Direct Manufacturing",
  whyFeature1Desc: "Work directly with the source.",
  whyFeature2Title: "Consistent Quality",
  whyFeature2Desc: "Material and finish checked before dispatch.",
  whyFeature3Title: "Custom Production",
  whyFeature3Desc: "Tailored to your requirements.",
  whyFeature4Title: "Export Packaging",
  whyFeature4Desc: "Safe for international transport.",
  whyFeature5Title: "Responsive Communication",
  whyFeature5Desc: "Clear coordination from enquiry to shipment.",
  whyFeature6Title: "Long-Term Partnerships",
  whyFeature6Desc: "Built on trust and reliability.",
  globalReachEyebrow: "GLOBAL REACH",
  globalReachTitle: "FROM INDIA, MADE FOR THE WORLD.",
  globalReachCopy: "Manufactured in South India \xB7 Prepared for international buyers.",
  galleryEyebrow: "GALLERY",
  galleryTitle: "Stone in Every Frame.",
  enquiryTitle: "LOOKING FOR THE RIGHT STONE?",
  enquiryCopy: "Tell us what you're looking for. We'll help you find the right material, finish and specification.",
  bannerTitle: "STONE THAT LASTS. PARTNERSHIPS THAT GROW.",
  bannerSubtitle: "South India \xB7 India",
  metric1Val: "25+",
  metric1Label: "Years of Experience",
  metric2Val: "Export Ready",
  metric2Label: "International Packaging",
  metric3Val: "Quality Focused",
  metric3Label: "Every Order Inspected",
  metric4Val: "Direct Manufacturer",
  metric4Label: "From India",
  footerCopy: "All rights reserved.",
  whatsappTemplate: "Hello SV Granites, I visited your website and would like to enquire about your granite products and export pricing.",
  emailSubjectTemplate: "Enquiry regarding Granite Products & Supply - SV Granites",
  emailBodyTemplate: "Dear SV Granites Team,\n\nI visited your website and would like to enquire regarding your natural stone collection and pricing.\n\nProject details:\n\nThank you!"
};
var DEFAULT_COLLECTIONS = [
  { name: "INDIAN BLACK GRANITE", category: "Signature Black", description: "Deep graphite \xB7 Mineral rhythm\nTimeless elegance", finish: "Leathered / Polished", imageUrl: "/images/indian-black.jpg", isFeatured: 1, sortOrder: 1, isVisible: 1 },
  { name: "ABSOLUTE BLACK GRANITE", category: "Architectural Slabs", description: "Deep black \xB7 Consistent texture\nHigh polish", finish: "Polished", imageUrl: "/images/absolute-black.jpg", isFeatured: 1, sortOrder: 2, isVisible: 1 },
  { name: "STEEL GREY GRANITE", category: "Cool Greys", description: "Layered grey \xB7 Sculptural presence\nPolished finish", finish: "Polished", imageUrl: "/images/steel-grey.jpg", isFeatured: 1, sortOrder: 3, isVisible: 1 },
  { name: "BLACK GALAXY GRANITE", category: "Sparkling Darks", description: "Sparkling darks \xB7 Radiant golden flecks\nHigh durability", finish: "Polished", imageUrl: "/images/black-galaxy.jpg", isFeatured: 1, sortOrder: 4, isVisible: 1 },
  { name: "TAN BROWN GRANITE", category: "Earthy Browns", description: "Warm brown \xB7 Distinctive pattern\nVersatile application", finish: "Versatile", imageUrl: "/images/tan-brown.jpg", isFeatured: 1, sortOrder: 5, isVisible: 1 }
];
var DEFAULT_GALLERY = [
  { title: "", location: "", year: "", imageUrl: "/images/indian-black.jpg", sortOrder: 1, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/absolute-black.jpg", sortOrder: 2, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/steel-grey.jpg", sortOrder: 3, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/black-galaxy.jpg", sortOrder: 4, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/tan-brown.jpg", sortOrder: 5, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/slabs-warehouse.jpg", sortOrder: 6, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/monument-headstone.jpg", sortOrder: 7, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/vases-collection.jpg", sortOrder: 8, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/craft-cutting.jpg", sortOrder: 9, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/hero-quarry.jpg", sortOrder: 10, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/noir-vein.jpg", sortOrder: 11, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/waterfall.jpg", sortOrder: 12, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/feature-wall.jpg", sortOrder: 13, isVisible: 1 },
  { title: "", location: "", year: "", imageUrl: "/images/cloud-ledger.jpg", sortOrder: 14, isVisible: 1 }
];
var DEFAULT_PRODUCTS = [
  { name: "GRANITE SLABS", description: "Premium granite surfaces selected for consistency, colour and finish.", imageUrl: "/images/slabs-warehouse.jpg", sortOrder: 1, isVisible: 1 },
  { name: "GRANITE MONUMENTS", description: "Precision-crafted memorial products designed for international markets.", imageUrl: "/images/monument-headstone.jpg", sortOrder: 2, isVisible: 1 },
  { name: "GRANITE VASES", description: "Elegant granite accessories crafted for memorial and landscaping applications.", imageUrl: "/images/vases-collection.jpg", sortOrder: 3, isVisible: 1 }
];
var DEFAULT_FINISHES = [
  { name: "POLISHED FINISH", tagline: "High gloss mirror reflection", badge: "Classic Elegance", description: "Brings out the deepest color saturation, crystalline depth, and mineral contrast. Impervious and pristine.", imageUrl: "/images/absolute-black.jpg", sortOrder: 1, isVisible: 1 },
  { name: "HONED FINISH", tagline: "Smooth matte velvet surface", badge: "Architectural Satin", description: "Non-reflective satin touch with subtle diffusion. Ideal for contemporary interior walls, floors, and vanity counters.", imageUrl: "/images/noir-vein.jpg", sortOrder: 2, isVisible: 1 },
  { name: "FLAMED FINISH", tagline: "Thermal textured slip-resistance", badge: "Exterior Grade", description: "Exposed to intense high-temperature flame causing surface crystals to burst into a rough, non-slip textured face.", imageUrl: "/images/steel-grey.jpg", sortOrder: 3, isVisible: 1 },
  { name: "LEATHERED FINISH", tagline: "Tactile undulating leather feel", badge: "Warm Tactility", description: "Diamond-tipped brush texturing that retains natural grain contour while offering a warm, soft antique grip.", imageUrl: "/images/tan-brown.jpg", sortOrder: 4, isVisible: 1 },
  { name: "BUSH HAMMERED FINISH", tagline: "Uniformly pitted rustic texture", badge: "Heavy Duty", description: "Hydraulic impact chiseling produces an evenly pitted stone relief. Perfect for outdoor walkways, steps, and plazas.", imageUrl: "/images/cloud-ledger.jpg", sortOrder: 5, isVisible: 1 },
  { name: "WATERJET FINISH", tagline: "Micro-etched natural stone relief", badge: "Modern Textured", description: "High-pressure hydrodynamic washing that preserves the stone's genuine color tone while generating non-skid relief.", imageUrl: "/images/waterfall.jpg", sortOrder: 6, isVisible: 1 },
  { name: "CUT-TO-SIZE & EDGE PROFILING", tagline: "CNC bevel, bullnose & mitred joints", badge: "Custom Fabrication", description: "Custom precision fabrication according to international architectural blueprints, monument specs, and facade details.", imageUrl: "/images/feature-wall.jpg", sortOrder: 7, isVisible: 1 }
];
var DEFAULT_SECTION_VISIBILITY = [
  { sectionKey: "hero", isVisible: 1 },
  { sectionKey: "about", isVisible: 1 },
  { sectionKey: "products", isVisible: 1 },
  { sectionKey: "collections", isVisible: 1 },
  { sectionKey: "finishes", isVisible: 1 },
  { sectionKey: "craft", isVisible: 1 },
  { sectionKey: "gallery", isVisible: 1 },
  { sectionKey: "facility", isVisible: 1 },
  { sectionKey: "contact", isVisible: 1 }
];

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  for (const field of textFields) {
    if (user[field] !== void 0) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId || user.email && user.email === process.env.ADMIN_EMAIL) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= /* @__PURE__ */ new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getSiteContent() {
  const db = await getDb();
  if (!db) return DEFAULT_CONTENT;
  const rows = await db.select().from(siteContent).limit(1);
  return rows[0] ?? DEFAULT_CONTENT;
}
async function getCollections() {
  const db = await getDb();
  if (!db) return DEFAULT_COLLECTIONS;
  const rows = await db.select().from(collections).where(eq(collections.isVisible, 1)).orderBy(asc(collections.sortOrder), asc(collections.id));
  return rows.length ? rows : DEFAULT_COLLECTIONS;
}
async function getAllCollections() {
  const db = await getDb();
  if (!db) return DEFAULT_COLLECTIONS;
  const rows = await db.select().from(collections).orderBy(asc(collections.sortOrder), asc(collections.id));
  return rows.length ? rows : DEFAULT_COLLECTIONS;
}
async function getGallery() {
  const db = await getDb();
  if (!db) return DEFAULT_GALLERY;
  const rows = await db.select().from(gallery).where(eq(gallery.isVisible, 1)).orderBy(asc(gallery.sortOrder), asc(gallery.id));
  return rows.length ? rows : DEFAULT_GALLERY;
}
async function getAllGallery() {
  const db = await getDb();
  if (!db) return DEFAULT_GALLERY;
  const rows = await db.select().from(gallery).orderBy(asc(gallery.sortOrder), asc(gallery.id));
  return rows.length ? rows : DEFAULT_GALLERY;
}
async function getProducts() {
  const db = await getDb();
  if (!db) return DEFAULT_PRODUCTS;
  const rows = await db.select().from(products).where(eq(products.isVisible, 1)).orderBy(asc(products.sortOrder), asc(products.id));
  return rows.length ? rows : DEFAULT_PRODUCTS;
}
async function getAllProducts() {
  const db = await getDb();
  if (!db) return DEFAULT_PRODUCTS;
  const rows = await db.select().from(products).orderBy(asc(products.sortOrder), asc(products.id));
  return rows.length ? rows : DEFAULT_PRODUCTS;
}
async function getFinishes() {
  const db = await getDb();
  if (!db) return DEFAULT_FINISHES;
  const rows = await db.select().from(finishes).where(eq(finishes.isVisible, 1)).orderBy(asc(finishes.sortOrder), asc(finishes.id));
  return rows.length ? rows : DEFAULT_FINISHES;
}
async function getAllFinishes() {
  const db = await getDb();
  if (!db) return DEFAULT_FINISHES;
  const rows = await db.select().from(finishes).orderBy(asc(finishes.sortOrder), asc(finishes.id));
  return rows.length ? rows : DEFAULT_FINISHES;
}
async function getSectionVisibility() {
  const db = await getDb();
  if (!db) return DEFAULT_SECTION_VISIBILITY;
  const rows = await db.select().from(sectionVisibility).orderBy(asc(sectionVisibility.id));
  return rows.length ? rows : DEFAULT_SECTION_VISIBILITY;
}
async function getEnquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
}
var _isSeeding = false;
async function seedGraniteContent() {
  if (_isSeeding) return;
  _isSeeding = true;
  try {
    const db = await getDb();
    if (!db) return;
    const current = await db.select().from(siteContent).limit(1);
    if (!current.length) await db.insert(siteContent).values(DEFAULT_CONTENT);
    const existingCollections = await db.select().from(collections).limit(1);
    if (!existingCollections.length) await db.insert(collections).values(DEFAULT_COLLECTIONS);
    const existingGallery = await db.select().from(gallery).limit(1);
    if (!existingGallery.length) await db.insert(gallery).values(DEFAULT_GALLERY);
    const existingProducts = await db.select().from(products).limit(1);
    if (!existingProducts.length) await db.insert(products).values(DEFAULT_PRODUCTS);
    const existingFinishes = await db.select().from(finishes).limit(1);
    if (!existingFinishes.length) await db.insert(finishes).values(DEFAULT_FINISHES);
    const existingVisibility = await db.select().from(sectionVisibility).limit(1);
    if (!existingVisibility.length) await db.insert(sectionVisibility).values(DEFAULT_SECTION_VISIBILITY);
  } finally {
    _isSeeding = false;
  }
}
async function updateSiteContent(input) {
  const db = await getDb();
  if (!db) return DEFAULT_CONTENT;
  await seedGraniteContent();
  const rows = await db.select({ id: siteContent.id }).from(siteContent).limit(1);
  const cleanInput = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== void 0 && value !== null) {
      cleanInput[key] = value;
    }
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  if (rows.length && rows[0]?.id) {
    await db.update(siteContent).set({ ...cleanInput, updatedAt: /* @__PURE__ */ new Date() }).where(eq(siteContent.id, rows[0].id));
  } else {
    await db.insert(siteContent).values({ ...DEFAULT_CONTENT, ...cleanInput });
  }
  return getSiteContent();
}
async function updateCollection(id, input) {
  const db = await getDb();
  if (!db) return null;
  const cleanInput = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== void 0) cleanInput[key] = value;
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  await db.update(collections).set(cleanInput).where(eq(collections.id, id));
  return db.select().from(collections).where(eq(collections.id, id)).limit(1);
}
async function createCollection(input) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(collections).values({
    name: input.name,
    category: input.category || "General",
    description: input.description || "",
    finish: input.finish || "Polished",
    imageUrl: input.imageUrl || "",
    isFeatured: input.isFeatured ?? 1,
    sortOrder: input.sortOrder ?? 0,
    isVisible: input.isVisible ?? 1
  }).returning({ id: collections.id });
  return result[0];
}
async function deleteCollection(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(collections).where(eq(collections.id, id));
  return true;
}
async function toggleCollectionVisibility(id, isVisible) {
  const db = await getDb();
  if (!db) return null;
  await db.update(collections).set({ isVisible }).where(eq(collections.id, id));
  return true;
}
async function updateGalleryItem(id, input) {
  const db = await getDb();
  if (!db) return null;
  const cleanInput = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== void 0) cleanInput[key] = value;
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  await db.update(gallery).set(cleanInput).where(eq(gallery.id, id));
  return db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
}
async function createGalleryItem(input) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(gallery).values({
    title: input.title || "",
    location: input.location || "",
    year: input.year || (/* @__PURE__ */ new Date()).getFullYear().toString(),
    imageUrl: input.imageUrl || "",
    sortOrder: input.sortOrder ?? 0,
    isVisible: input.isVisible ?? 1
  }).returning({ id: gallery.id });
  return result[0];
}
async function deleteGalleryItem(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(gallery).where(eq(gallery.id, id));
  return true;
}
async function toggleGalleryVisibility(id, isVisible) {
  const db = await getDb();
  if (!db) return null;
  await db.update(gallery).set({ isVisible }).where(eq(gallery.id, id));
  return true;
}
async function updateProduct(id, input) {
  const db = await getDb();
  if (!db) return null;
  const cleanInput = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== void 0) cleanInput[key] = value;
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  await db.update(products).set(cleanInput).where(eq(products.id, id));
  return db.select().from(products).where(eq(products.id, id)).limit(1);
}
async function createProduct(input) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(products).values({
    name: input.name,
    description: input.description || "",
    imageUrl: input.imageUrl || "",
    sortOrder: input.sortOrder ?? 0,
    isVisible: input.isVisible ?? 1
  }).returning({ id: products.id });
  return result[0];
}
async function deleteProduct(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(products).where(eq(products.id, id));
  return true;
}
async function toggleProductVisibility(id, isVisible) {
  const db = await getDb();
  if (!db) return null;
  await db.update(products).set({ isVisible }).where(eq(products.id, id));
  return true;
}
async function updateFinish(id, input) {
  const db = await getDb();
  if (!db) return null;
  const cleanInput = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== void 0) cleanInput[key] = value;
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  await db.update(finishes).set(cleanInput).where(eq(finishes.id, id));
  return db.select().from(finishes).where(eq(finishes.id, id)).limit(1);
}
async function createFinish(input) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(finishes).values({
    name: input.name,
    tagline: input.tagline || "",
    description: input.description || "",
    badge: input.badge || "Classic",
    imageUrl: input.imageUrl || "",
    sortOrder: input.sortOrder ?? 0,
    isVisible: input.isVisible ?? 1
  }).returning({ id: finishes.id });
  return result[0];
}
async function deleteFinish(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(finishes).where(eq(finishes.id, id));
  return true;
}
async function toggleFinishVisibility(id, isVisible) {
  const db = await getDb();
  if (!db) return null;
  await db.update(finishes).set({ isVisible }).where(eq(finishes.id, id));
  return true;
}
async function updateSectionVisibility(sectionKey, isVisible) {
  const db = await getDb();
  if (!db) return null;
  await db.update(sectionVisibility).set({ isVisible }).where(eq(sectionVisibility.sectionKey, sectionKey));
  return true;
}
async function createEnquiry(input) {
  appendEnquiryToGoogleSheet(input).catch((err) => {
    console.error("[Google Sheets] Async forward error:", err);
  });
  const db = await getDb();
  if (!db) return { ...input, id: Date.now(), createdAt: /* @__PURE__ */ new Date() };
  const result = await db.insert(enquiries).values(input).returning({ id: enquiries.id });
  return { id: Number(result[0].id), ...input };
}
async function updateEnquiryStatus(id, status) {
  const db = await getDb();
  if (!db) return null;
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));
  return true;
}
async function deleteEnquiry(id) {
  const db = await getDb();
  if (!db) return { success: false };
  const rows = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  const target = rows[0];
  let sheetResult = { syncedToSheet: false, reason: "not_found" };
  if (target) {
    sheetResult = await deleteEnquiryFromGoogleSheet({
      id: target.id,
      name: target.name,
      email: target.email,
      phone: target.phone,
      timestamp: target.createdAt
    }).catch((err) => {
      console.error("[Google Sheets] Async delete error:", err);
      return { syncedToSheet: false, reason: err.message };
    });
  }
  await db.delete(enquiries).where(eq(enquiries.id, id));
  return { success: true, sheetResult };
}
async function deleteEnquiriesBulk(ids) {
  const db = await getDb();
  if (!db) return { success: false, count: 0, sheetSuccessCount: 0 };
  let count = 0;
  let sheetSuccessCount = 0;
  for (const id of ids) {
    const res = await deleteEnquiry(id);
    if (res.success) {
      count++;
      if (res.sheetResult?.syncedToSheet) {
        sheetSuccessCount++;
      }
    }
  }
  return { success: true, count, sheetSuccessCount };
}
async function syncEnquiriesFromGoogleSheet(customUrl) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  let url = customUrl;
  if (!url) {
    const content = await getSiteContent();
    if (content?.googleSheetUrl) {
      url = content.googleSheetUrl;
    }
  }
  const sheetItems = await fetchEnquiriesFromGoogleSheet(url);
  if (!sheetItems || sheetItems.length === 0) {
    return { success: true, count: 0, added: 0, updated: 0, message: "No rows found in sheet" };
  }
  const existingEnquiries = await db.select().from(enquiries);
  let added = 0;
  let updated = 0;
  for (const item of sheetItems) {
    const itemEmail = item.email.toLowerCase().trim();
    const itemPhone = item.phone.replace(/\D/g, "");
    const itemName = item.name.toLowerCase().trim();
    const existing = existingEnquiries.find((e) => {
      const eEmail = e.email.toLowerCase().trim();
      const ePhone = e.phone.replace(/\D/g, "");
      const eName = e.name.toLowerCase().trim();
      if (eEmail && itemEmail && eEmail !== "no-email@client.com" && eEmail === itemEmail) return true;
      if (ePhone && itemPhone && ePhone === itemPhone && eName === itemName) return true;
      return false;
    });
    if (existing) {
      if (item.status && item.status !== existing.status) {
        await db.update(enquiries).set({ status: item.status }).where(eq(enquiries.id, existing.id));
        updated++;
      }
    } else {
      await db.insert(enquiries).values({
        name: item.name,
        email: item.email,
        phone: item.phone,
        projectType: item.projectType,
        message: item.message,
        status: item.status || "new",
        createdAt: item.createdAt ? new Date(item.createdAt) : /* @__PURE__ */ new Date()
      });
      added++;
    }
  }
  return { success: true, count: sheetItems.length, added, updated };
}
async function reorderProducts(orderedIds) {
  const db = await getDb();
  if (!db) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(products).set({ sortOrder: i + 1 }).where(eq(products.id, orderedIds[i]));
  }
  return true;
}
async function reorderCollections(orderedIds) {
  const db = await getDb();
  if (!db) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(collections).set({ sortOrder: i + 1 }).where(eq(collections.id, orderedIds[i]));
  }
  return true;
}
async function reorderFinishes(orderedIds) {
  const db = await getDb();
  if (!db) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(finishes).set({ sortOrder: i + 1 }).where(eq(finishes.id, orderedIds[i]));
  }
  return true;
}
async function reorderGallery(orderedIds) {
  const db = await getDb();
  if (!db) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(gallery).set({ sortOrder: i + 1 }).where(eq(gallery.id, orderedIds[i]));
  }
  return true;
}

// server/routers.ts
var contentInput = z2.object({
  brandName: z2.string().nullish(),
  tagline: z2.string().nullish(),
  heroEyebrow: z2.string().nullish(),
  heroTitle: z2.string().nullish(),
  heroCopy: z2.string().nullish(),
  aboutTitle: z2.string().nullish(),
  aboutCopy: z2.string().nullish(),
  phone: z2.string().nullish(),
  whatsapp: z2.string().nullish(),
  email: z2.string().nullish(),
  address: z2.string().nullish(),
  hours: z2.string().nullish(),
  heroImage: z2.string().nullish(),
  heroImage2: z2.string().nullish(),
  aboutImage: z2.string().nullish(),
  logoImage: z2.string().nullish(),
  heroSubtext: z2.string().nullish(),
  facilityImage1: z2.string().nullish(),
  facilityImage2: z2.string().nullish(),
  facilityImage3: z2.string().nullish(),
  facilityImage4: z2.string().nullish(),
  facilityImage5: z2.string().nullish(),
  facilityTitle: z2.string().nullish(),
  facilityCopy: z2.string().nullish(),
  bannerImage: z2.string().nullish(),
  mapsUrl: z2.string().nullish(),
  googleSheetUrl: z2.string().nullish(),
  productsEyebrow: z2.string().nullish(),
  productsTitle: z2.string().nullish(),
  productsCopy: z2.string().nullish(),
  collectionsEyebrow: z2.string().nullish(),
  collectionsTitle: z2.string().nullish(),
  collectionsCopy: z2.string().nullish(),
  finishesEyebrow: z2.string().nullish(),
  finishesTitle: z2.string().nullish(),
  finishesCopy: z2.string().nullish(),
  whyChooseEyebrow: z2.string().nullish(),
  whyChooseTitle: z2.string().nullish(),
  whyFeature1Title: z2.string().nullish(),
  whyFeature1Desc: z2.string().nullish(),
  whyFeature2Title: z2.string().nullish(),
  whyFeature2Desc: z2.string().nullish(),
  whyFeature3Title: z2.string().nullish(),
  whyFeature3Desc: z2.string().nullish(),
  whyFeature4Title: z2.string().nullish(),
  whyFeature4Desc: z2.string().nullish(),
  whyFeature5Title: z2.string().nullish(),
  whyFeature5Desc: z2.string().nullish(),
  whyFeature6Title: z2.string().nullish(),
  whyFeature6Desc: z2.string().nullish(),
  globalReachEyebrow: z2.string().nullish(),
  globalReachTitle: z2.string().nullish(),
  globalReachCopy: z2.string().nullish(),
  galleryEyebrow: z2.string().nullish(),
  galleryTitle: z2.string().nullish(),
  enquiryTitle: z2.string().nullish(),
  enquiryCopy: z2.string().nullish(),
  bannerTitle: z2.string().nullish(),
  bannerSubtitle: z2.string().nullish(),
  metric1Val: z2.string().nullish(),
  metric1Label: z2.string().nullish(),
  metric2Val: z2.string().nullish(),
  metric2Label: z2.string().nullish(),
  metric3Val: z2.string().nullish(),
  metric3Label: z2.string().nullish(),
  metric4Val: z2.string().nullish(),
  metric4Label: z2.string().nullish(),
  footerCopy: z2.string().nullish(),
  whatsappTemplate: z2.string().nullish(),
  emailSubjectTemplate: z2.string().nullish(),
  emailBodyTemplate: z2.string().nullish()
});
var collectionInput = z2.object({
  name: z2.string().min(1),
  category: z2.string().nullish(),
  description: z2.string().nullish(),
  finish: z2.string().nullish(),
  imageUrl: z2.string().nullish(),
  isFeatured: z2.number().int().min(0).max(1).nullish(),
  sortOrder: z2.number().int().nullish(),
  isVisible: z2.number().int().min(0).max(1).nullish()
});
var galleryInput = z2.object({
  title: z2.string().nullish(),
  location: z2.string().nullish(),
  year: z2.string().nullish(),
  imageUrl: z2.string().min(1),
  sortOrder: z2.number().int().nullish(),
  isVisible: z2.number().int().min(0).max(1).nullish()
});
var productInput = z2.object({
  name: z2.string().min(1),
  description: z2.string().nullish(),
  imageUrl: z2.string().nullish(),
  sortOrder: z2.number().int().nullish(),
  isVisible: z2.number().int().min(0).max(1).nullish()
});
var finishInput = z2.object({
  name: z2.string().min(1),
  tagline: z2.string().nullish(),
  description: z2.string().nullish(),
  badge: z2.string().nullish(),
  imageUrl: z2.string().nullish(),
  sortOrder: z2.number().int().nullish(),
  isVisible: z2.number().int().min(0).max(1).nullish()
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      if (typeof ctx.res?.clearCookie === "function") {
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      }
      return { success: true };
    })
  }),
  site: router({
    content: publicProcedure.query(async () => {
      await seedGraniteContent();
      return getSiteContent();
    }),
    collections: publicProcedure.query(getCollections),
    gallery: publicProcedure.query(getGallery),
    products: publicProcedure.query(getProducts),
    finishes: publicProcedure.query(getFinishes),
    sectionVisibility: publicProcedure.query(getSectionVisibility),
    enquiry: publicProcedure.input(z2.object({ name: z2.string().min(2), email: z2.string().email(), phone: z2.string().min(5), projectType: z2.string().min(2), message: z2.string().min(5) })).mutation(({ input }) => createEnquiry({ ...input, status: "new" }))
  }),
  admin: router({
    content: adminProcedure.query(async () => {
      await seedGraniteContent();
      return getSiteContent();
    }),
    saveContent: adminProcedure.input(contentInput).mutation(({ input }) => updateSiteContent(input)),
    // Collections
    collections: adminProcedure.query(async () => {
      await seedGraniteContent();
      return getAllCollections();
    }),
    saveCollection: adminProcedure.input(z2.object({ id: z2.number().int(), data: collectionInput })).mutation(({ input }) => updateCollection(input.id, input.data)),
    createCollection: adminProcedure.input(collectionInput).mutation(({ input }) => createCollection({ name: input.name, category: input.category, description: input.description, finish: input.finish, imageUrl: input.imageUrl, isFeatured: input.isFeatured ?? 1 })),
    deleteCollection: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(({ input }) => deleteCollection(input.id)),
    toggleCollectionVisibility: adminProcedure.input(z2.object({ id: z2.number().int(), isVisible: z2.number().int().min(0).max(1) })).mutation(({ input }) => toggleCollectionVisibility(input.id, input.isVisible)),
    reorderCollections: adminProcedure.input(z2.array(z2.number().int())).mutation(({ input }) => reorderCollections(input)),
    // Gallery
    gallery: adminProcedure.query(async () => {
      await seedGraniteContent();
      return getAllGallery();
    }),
    saveGallery: adminProcedure.input(z2.object({ id: z2.number().int(), data: galleryInput })).mutation(({ input }) => updateGalleryItem(input.id, input.data)),
    createGallery: adminProcedure.input(galleryInput).mutation(({ input }) => createGalleryItem({ ...input, sortOrder: input.sortOrder ?? 0 })),
    deleteGallery: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(({ input }) => deleteGalleryItem(input.id)),
    toggleGalleryVisibility: adminProcedure.input(z2.object({ id: z2.number().int(), isVisible: z2.number().int().min(0).max(1) })).mutation(({ input }) => toggleGalleryVisibility(input.id, input.isVisible)),
    reorderGallery: adminProcedure.input(z2.array(z2.number().int())).mutation(({ input }) => reorderGallery(input)),
    // Products
    products: adminProcedure.query(async () => {
      await seedGraniteContent();
      return getAllProducts();
    }),
    saveProduct: adminProcedure.input(z2.object({ id: z2.number().int(), data: productInput })).mutation(({ input }) => updateProduct(input.id, input.data)),
    createProduct: adminProcedure.input(productInput).mutation(({ input }) => createProduct({ name: input.name, description: input.description, imageUrl: input.imageUrl, sortOrder: input.sortOrder ?? 0 })),
    deleteProduct: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(({ input }) => deleteProduct(input.id)),
    toggleProductVisibility: adminProcedure.input(z2.object({ id: z2.number().int(), isVisible: z2.number().int().min(0).max(1) })).mutation(({ input }) => toggleProductVisibility(input.id, input.isVisible)),
    reorderProducts: adminProcedure.input(z2.array(z2.number().int())).mutation(({ input }) => reorderProducts(input)),
    // Finishes
    finishes: adminProcedure.query(async () => {
      await seedGraniteContent();
      return getAllFinishes();
    }),
    saveFinish: adminProcedure.input(z2.object({ id: z2.number().int(), data: finishInput })).mutation(({ input }) => updateFinish(input.id, input.data)),
    createFinish: adminProcedure.input(finishInput).mutation(({ input }) => createFinish({ name: input.name, tagline: input.tagline, description: input.description, badge: input.badge, imageUrl: input.imageUrl, sortOrder: input.sortOrder ?? 0 })),
    deleteFinish: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(({ input }) => deleteFinish(input.id)),
    toggleFinishVisibility: adminProcedure.input(z2.object({ id: z2.number().int(), isVisible: z2.number().int().min(0).max(1) })).mutation(({ input }) => toggleFinishVisibility(input.id, input.isVisible)),
    reorderFinishes: adminProcedure.input(z2.array(z2.number().int())).mutation(({ input }) => reorderFinishes(input)),
    // Section Visibility
    sectionVisibility: adminProcedure.query(async () => {
      await seedGraniteContent();
      return getSectionVisibility();
    }),
    updateSectionVisibility: adminProcedure.input(z2.object({ sectionKey: z2.string(), isVisible: z2.number().int().min(0).max(1) })).mutation(({ input }) => updateSectionVisibility(input.sectionKey, input.isVisible)),
    // Enquiries
    enquiries: adminProcedure.query(getEnquiries),
    updateEnquiry: adminProcedure.input(z2.object({ id: z2.number().int(), status: z2.string() })).mutation(({ input }) => updateEnquiryStatus(input.id, input.status)),
    deleteEnquiry: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(({ input }) => deleteEnquiry(input.id)),
    deleteEnquiriesBulk: adminProcedure.input(z2.object({ ids: z2.array(z2.number().int()) })).mutation(({ input }) => deleteEnquiriesBulk(input.ids)),
    syncFromGoogleSheet: adminProcedure.input(z2.object({ sheetUrl: z2.string().optional() })).mutation(({ input }) => syncEnquiriesFromGoogleSheet(input.sheetUrl))
  })
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || typeof appId !== "string" || // allow empty appId for local Google OAuth
      !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId: appId || "",
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      if (sessionUserId.startsWith("google_")) {
        throw ForbiddenError("Google user not found in DB \u2014 try signing in again");
      }
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/fetchContext.ts
async function createFetchContext(opts) {
  let user = null;
  const cookieHeader = opts.req.headers.get("cookie") ?? "";
  const authHeader = opts.req.headers.get("authorization") ?? void 0;
  const reqLike = {
    headers: {
      cookie: cookieHeader,
      authorization: authHeader
    }
  };
  try {
    user = await sdk.authenticateRequest(reqLike);
  } catch {
    user = null;
  }
  const res = {
    clearCookie: (name) => {
      opts.resHeaders.append(
        "Set-Cookie",
        `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`
      );
    }
  };
  return {
    req: reqLike,
    // pass the shim so getSessionCookieOptions in routers doesn't fail
    resHeaders: opts.resHeaders,
    user,
    res
  };
}

// server/api/trpc/[trpc].ts
async function handler(req) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createFetchContext,
    onError({ error, path }) {
      if (process.env.NODE_ENV === "development") {
        console.error(`[tRPC Error] ${path ?? "unknown"}:`, error.message);
      }
    }
  });
}
export {
  handler as default
};
