// server/api/auth/google/callback.ts
import { SignJWT } from "jose";

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

// server/api/auth/google/callback.ts
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var COOKIE_NAME = "app_session_id";
function getAppUrl(req) {
  if (process.env.VITE_APP_URL) {
    return process.env.VITE_APP_URL.replace(/\/+$/, "");
  }
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) {
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}
async function handler(req) {
  const appUrl = getAppUrl(req);
  const url = req.url.startsWith("http") ? new URL(req.url) : new URL(req.url, appUrl);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    console.error("[Google OAuth Callback] Error from Google:", error);
    return Response.redirect(`${appUrl}/?auth=error`, 302);
  }
  if (!code) {
    return new Response("Missing OAuth code", { status: 400 });
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!clientId || !clientSecret || !jwtSecret || !adminEmail) {
    console.error("[Google OAuth Callback] Missing required env vars");
    return new Response("Server configuration error", { status: 500 });
  }
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    if (!tokenRes.ok) {
      const err = await tokenRes.text().catch(() => "");
      console.error("[Google OAuth Callback] Token exchange failed:", err);
      return new Response("Token exchange failed", { status: 500 });
    }
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response("No access token received", { status: 500 });
    }
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      }
    );
    if (!userInfoRes.ok) {
      return new Response("Failed to fetch user info from Google", {
        status: 500
      });
    }
    const userInfo = await userInfoRes.json();
    if (!userInfo.email || userInfo.email !== adminEmail) {
      console.warn(
        `[Google OAuth Callback] Unauthorized login attempt: ${userInfo.email}`
      );
      return Response.redirect(`${appUrl}/?auth=unauthorized`, 302);
    }
    const openId = `google_${userInfo.sub}`;
    const name = userInfo.name ?? userInfo.email ?? "Admin";
    await upsertUser({
      openId,
      name,
      email: userInfo.email,
      loginMethod: "google",
      lastSignedIn: /* @__PURE__ */ new Date(),
      role: "admin"
    });
    const secretKey = new TextEncoder().encode(jwtSecret);
    const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1e3);
    const sessionToken = await new SignJWT({ openId, appId: "", name }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
    const isLocalhost = appUrl.includes("localhost");
    const cookieFlags = isLocalhost ? `Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR_MS / 1e3}` : `Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR_MS / 1e3}; Secure`;
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/admin`,
        "Set-Cookie": `${COOKIE_NAME}=${sessionToken}; ${cookieFlags}`
      }
    });
  } catch (err) {
    console.error("[Google OAuth Callback] Unexpected error:", err);
    return new Response("OAuth callback failed", { status: 500 });
  }
}
export {
  handler as default
};
