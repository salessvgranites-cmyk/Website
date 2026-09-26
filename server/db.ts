import { asc, desc, eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { InsertUser, collections, enquiries, finishes, gallery, products, sectionVisibility, siteContent, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { appendEnquiryToGoogleSheet, deleteEnquiryFromGoogleSheet, fetchEnquiriesFromGoogleSheet } from "./googleSheets";

let _db: ReturnType<typeof drizzle> | null = null;

export {
  DEFAULT_COLLECTIONS,
  DEFAULT_CONTENT,
  DEFAULT_FINISHES,
  DEFAULT_GALLERY,
  DEFAULT_PRODUCTS,
  DEFAULT_SECTION_VISIBILITY,
} from "@shared/contentDefaults";
import {
  DEFAULT_COLLECTIONS,
  DEFAULT_CONTENT,
  DEFAULT_FINISHES,
  DEFAULT_GALLERY,
  DEFAULT_PRODUCTS,
  DEFAULT_SECTION_VISIBILITY,
} from "@shared/contentDefaults";

export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId || (user.email && user.email === process.env.ADMIN_EMAIL)) {
    values.role = 'admin'; updateSet.role = 'admin';
  }
  values.lastSignedIn ??= new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getSiteContent() {
  const db = await getDb(); if (!db) return DEFAULT_CONTENT;
  const rows = await db.select().from(siteContent).limit(1);
  return rows[0] ?? DEFAULT_CONTENT;
}

export async function getCollections() {
  const db = await getDb(); if (!db) return DEFAULT_COLLECTIONS;
  const rows = await db.select().from(collections).where(eq(collections.isVisible, 1)).orderBy(asc(collections.sortOrder), asc(collections.id));
  return rows.length ? rows : DEFAULT_COLLECTIONS;
}

export async function getAllCollections() {
  const db = await getDb(); if (!db) return DEFAULT_COLLECTIONS;
  const rows = await db.select().from(collections).orderBy(asc(collections.sortOrder), asc(collections.id));
  return rows.length ? rows : DEFAULT_COLLECTIONS;
}

export async function getGallery() {
  const db = await getDb(); if (!db) return DEFAULT_GALLERY;
  const rows = await db.select().from(gallery).where(eq(gallery.isVisible, 1)).orderBy(asc(gallery.sortOrder), asc(gallery.id));
  return rows.length ? rows : DEFAULT_GALLERY;
}

export async function getAllGallery() {
  const db = await getDb(); if (!db) return DEFAULT_GALLERY;
  const rows = await db.select().from(gallery).orderBy(asc(gallery.sortOrder), asc(gallery.id));
  return rows.length ? rows : DEFAULT_GALLERY;
}

export async function getProducts() {
  const db = await getDb(); if (!db) return DEFAULT_PRODUCTS;
  const rows = await db.select().from(products).where(eq(products.isVisible, 1)).orderBy(asc(products.sortOrder), asc(products.id));
  return rows.length ? rows : DEFAULT_PRODUCTS;
}

export async function getAllProducts() {
  const db = await getDb(); if (!db) return DEFAULT_PRODUCTS;
  const rows = await db.select().from(products).orderBy(asc(products.sortOrder), asc(products.id));
  return rows.length ? rows : DEFAULT_PRODUCTS;
}

export async function getFinishes() {
  const db = await getDb(); if (!db) return DEFAULT_FINISHES;
  const rows = await db.select().from(finishes).where(eq(finishes.isVisible, 1)).orderBy(asc(finishes.sortOrder), asc(finishes.id));
  return rows.length ? rows : DEFAULT_FINISHES;
}

export async function getAllFinishes() {
  const db = await getDb(); if (!db) return DEFAULT_FINISHES;
  const rows = await db.select().from(finishes).orderBy(asc(finishes.sortOrder), asc(finishes.id));
  return rows.length ? rows : DEFAULT_FINISHES;
}

export async function getSectionVisibility() {
  const db = await getDb(); if (!db) return DEFAULT_SECTION_VISIBILITY;
  const rows = await db.select().from(sectionVisibility).orderBy(asc(sectionVisibility.id));
  return rows.length ? rows : DEFAULT_SECTION_VISIBILITY;
}

export async function getEnquiries() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
}

let _isSeeding = false;
export async function seedGraniteContent() {
  if (_isSeeding) return;
  _isSeeding = true;
  try {
    const db = await getDb(); if (!db) return;
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

export async function updateSiteContent(input: Record<string, any>) {
  const db = await getDb(); if (!db) return DEFAULT_CONTENT;
  await seedGraniteContent();
  const rows = await db.select({ id: siteContent.id }).from(siteContent).limit(1);
  const cleanInput: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null) {
      cleanInput[key] = value;
    }
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  if (rows.length && rows[0]?.id) {
    await db.update(siteContent).set({ ...cleanInput, updatedAt: new Date() }).where(eq(siteContent.id, rows[0].id));
  } else {
    await db.insert(siteContent).values({ ...DEFAULT_CONTENT, ...cleanInput });
  }
  return getSiteContent();
}

// --- Collections ---
export async function updateCollection(id: number, input: Record<string, any>) {
  const db = await getDb(); if (!db) return null;
  const cleanInput: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) cleanInput[key] = value;
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  await db.update(collections).set(cleanInput).where(eq(collections.id, id));
  return db.select().from(collections).where(eq(collections.id, id)).limit(1);
}
export async function createCollection(input: {
  name: string;
  category?: string | null;
  description?: string | null;
  finish?: string | null;
  imageUrl?: string | null;
  isFeatured?: number | null;
  sortOrder?: number | null;
  isVisible?: number | null;
}) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(collections).values({
    name: input.name,
    category: input.category || "General",
    description: input.description || "",
    finish: input.finish || "Polished",
    imageUrl: input.imageUrl || "",
    isFeatured: input.isFeatured ?? 1,
    sortOrder: input.sortOrder ?? 0,
    isVisible: input.isVisible ?? 1,
  }).returning({ id: collections.id });
  return result[0];
}
export async function deleteCollection(id: number) {
  const db = await getDb(); if (!db) return null;
  await db.delete(collections).where(eq(collections.id, id));
  return true;
}
export async function toggleCollectionVisibility(id: number, isVisible: number) {
  const db = await getDb(); if (!db) return null;
  await db.update(collections).set({ isVisible }).where(eq(collections.id, id));
  return true;
}

// --- Gallery ---
export async function updateGalleryItem(id: number, input: Record<string, any>) {
  const db = await getDb(); if (!db) return null;
  const cleanInput: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) cleanInput[key] = value;
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  await db.update(gallery).set(cleanInput).where(eq(gallery.id, id));
  return db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
}
export async function createGalleryItem(input: {
  title?: string | null;
  location?: string | null;
  year?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isVisible?: number | null;
}) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(gallery).values({
    title: input.title || "",
    location: input.location || "",
    year: input.year || new Date().getFullYear().toString(),
    imageUrl: input.imageUrl || "",
    sortOrder: input.sortOrder ?? 0,
    isVisible: input.isVisible ?? 1,
  }).returning({ id: gallery.id });
  return result[0];
}
export async function deleteGalleryItem(id: number) {
  const db = await getDb(); if (!db) return null;
  await db.delete(gallery).where(eq(gallery.id, id));
  return true;
}
export async function toggleGalleryVisibility(id: number, isVisible: number) {
  const db = await getDb(); if (!db) return null;
  await db.update(gallery).set({ isVisible }).where(eq(gallery.id, id));
  return true;
}

// --- Products ---
export async function updateProduct(id: number, input: Record<string, any>) {
  const db = await getDb(); if (!db) return null;
  const cleanInput: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) cleanInput[key] = value;
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  await db.update(products).set(cleanInput).where(eq(products.id, id));
  return db.select().from(products).where(eq(products.id, id)).limit(1);
}
export async function createProduct(input: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isVisible?: number | null;
}) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(products).values({
    name: input.name,
    description: input.description || "",
    imageUrl: input.imageUrl || "",
    sortOrder: input.sortOrder ?? 0,
    isVisible: input.isVisible ?? 1,
  }).returning({ id: products.id });
  return result[0];
}
export async function deleteProduct(id: number) {
  const db = await getDb(); if (!db) return null;
  await db.delete(products).where(eq(products.id, id));
  return true;
}
export async function toggleProductVisibility(id: number, isVisible: number) {
  const db = await getDb(); if (!db) return null;
  await db.update(products).set({ isVisible }).where(eq(products.id, id));
  return true;
}

// --- Finishes ---
export async function updateFinish(id: number, input: Record<string, any>) {
  const db = await getDb(); if (!db) return null;
  const cleanInput: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) cleanInput[key] = value;
  }
  delete cleanInput.id;
  delete cleanInput.createdAt;
  delete cleanInput.updatedAt;
  await db.update(finishes).set(cleanInput).where(eq(finishes.id, id));
  return db.select().from(finishes).where(eq(finishes.id, id)).limit(1);
}
export async function createFinish(input: {
  name: string;
  tagline?: string | null;
  description?: string | null;
  badge?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
  isVisible?: number | null;
}) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(finishes).values({
    name: input.name,
    tagline: input.tagline || "",
    description: input.description || "",
    badge: input.badge || "Classic",
    imageUrl: input.imageUrl || "",
    sortOrder: input.sortOrder ?? 0,
    isVisible: input.isVisible ?? 1,
  }).returning({ id: finishes.id });
  return result[0];
}
export async function deleteFinish(id: number) {
  const db = await getDb(); if (!db) return null;
  await db.delete(finishes).where(eq(finishes.id, id));
  return true;
}
export async function toggleFinishVisibility(id: number, isVisible: number) {
  const db = await getDb(); if (!db) return null;
  await db.update(finishes).set({ isVisible }).where(eq(finishes.id, id));
  return true;
}

// --- Section Visibility ---
export async function updateSectionVisibility(sectionKey: string, isVisible: number) {
  const db = await getDb(); if (!db) return null;
  await db.update(sectionVisibility).set({ isVisible }).where(eq(sectionVisibility.sectionKey, sectionKey));
  return true;
}

// --- Enquiries ---
export async function createEnquiry(input: typeof enquiries.$inferInsert) {
  appendEnquiryToGoogleSheet(input).catch(err => {
    console.error("[Google Sheets] Async forward error:", err);
  });
  const db = await getDb(); if (!db) return { ...input, id: Date.now(), createdAt: new Date() };
  const result = await db.insert(enquiries).values(input).returning({ id: enquiries.id });
  return { id: Number(result[0].id), ...input };
}

export async function updateEnquiryStatus(id: number, status: string) {
  const db = await getDb(); if (!db) return null;
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));
  return true;
}

export async function deleteEnquiry(id: number) {
  const db = await getDb(); if (!db) return { success: false };
  // Get enquiry info first to delete from Google Sheets
  const rows = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  const target = rows[0];
  let sheetResult: { syncedToSheet: boolean; reason?: string } = { syncedToSheet: false, reason: "not_found" };
  if (target) {
    sheetResult = await deleteEnquiryFromGoogleSheet({
      id: target.id,
      name: target.name,
      email: target.email,
      phone: target.phone,
      timestamp: target.createdAt,
    }).catch(err => {
      console.error("[Google Sheets] Async delete error:", err);
      return { syncedToSheet: false, reason: err.message };
    });
  }
  await db.delete(enquiries).where(eq(enquiries.id, id));
  return { success: true, sheetResult };
}

export async function deleteEnquiriesBulk(ids: number[]) {
  const db = await getDb(); if (!db) return { success: false, count: 0, sheetSuccessCount: 0 };
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

export async function syncEnquiriesFromGoogleSheet(customUrl?: string) {
  const db = await getDb(); if (!db) throw new Error("Database not connected");
  
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

    // Match by email OR (phone AND name)
    const existing = existingEnquiries.find(e => {
      const eEmail = e.email.toLowerCase().trim();
      const ePhone = e.phone.replace(/\D/g, "");
      const eName = e.name.toLowerCase().trim();

      if (eEmail && itemEmail && eEmail !== "no-email@client.com" && eEmail === itemEmail) return true;
      if (ePhone && itemPhone && ePhone === itemPhone && eName === itemName) return true;
      return false;
    });

    if (existing) {
      // Update status if it changed
      if (item.status && item.status !== existing.status) {
        await db.update(enquiries).set({ status: item.status }).where(eq(enquiries.id, existing.id));
        updated++;
      }
    } else {
      // Insert new enquiry
      await db.insert(enquiries).values({
        name: item.name,
        email: item.email,
        phone: item.phone,
        projectType: item.projectType,
        message: item.message,
        status: item.status || "new",
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      });
      added++;
    }
  }

  return { success: true, count: sheetItems.length, added, updated };
}

// --- Reordering ---
export async function reorderProducts(orderedIds: number[]) {
  const db = await getDb(); if (!db) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(products).set({ sortOrder: i + 1 }).where(eq(products.id, orderedIds[i]));
  }
  return true;
}

export async function reorderCollections(orderedIds: number[]) {
  const db = await getDb(); if (!db) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(collections).set({ sortOrder: i + 1 }).where(eq(collections.id, orderedIds[i]));
  }
  return true;
}

export async function reorderFinishes(orderedIds: number[]) {
  const db = await getDb(); if (!db) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(finishes).set({ sortOrder: i + 1 }).where(eq(finishes.id, orderedIds[i]));
  }
  return true;
}

export async function reorderGallery(orderedIds: number[]) {
  const db = await getDb(); if (!db) return false;
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(gallery).set({ sortOrder: i + 1 }).where(eq(gallery.id, orderedIds[i]));
  }
  return true;
}
