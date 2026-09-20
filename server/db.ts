import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, collections, enquiries, gallery, siteContent, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export const DEFAULT_CONTENT = {
  brandName: "Sri Venkateswara Granites",
  tagline: "Crafted by Nature. Perfected by Us.",
  heroEyebrow: "Premium natural stone · Since 1998",
  heroTitle: "Stone with a point of view.",
  heroCopy: "Architectural granite selected for bold residences, refined hospitality, and spaces made to last generations.",
  aboutTitle: "The quiet confidence of exceptional stone.",
  aboutCopy: "From our yard to your project, every slab is inspected for character, consistency, and cut. We pair the drama of natural stone with a precise, considered service—from selection to installation.",
  phone: "9790613468",
  whatsapp: "9790613468",
  email: "Shrivatsan@icloud.com",
  address: "NO.951/3,Poovallikuppam Village Kadampathur Block, Post, Mappedu, Chennai, Tamil Nadu 602105",
  hours: "Mon–Sat · 9:30 AM — 6:30 PM",
  heroImage: "/images/hero.jpg",
  aboutImage: "/images/waterfall.jpg",
  logoImage: "/images/logo.jpg",
};

export const DEFAULT_COLLECTIONS = [
  { name: "Indian Black Granite", category: "Signature Black", description: "Deep graphite with a quiet, mineral rhythm for dramatic islands and monolithic walls.", finish: "Leathered", imageUrl: "/images/indian-black.jpg", isFeatured: 1 },
  { name: "Absolute Black Granite", category: "Architectural Slabs", description: "A near-black surface with a velvet depth for fireplace surrounds and hotel statements.", finish: "Honed", imageUrl: "/images/absolute-black.jpg", isFeatured: 1 },
  { name: "Steel Grey Granite", category: "Cool Greys", description: "Layered grey movement with a sculptural presence for feature walls and hospitality spaces.", finish: "Polished", imageUrl: "/images/steel-grey.jpg", isFeatured: 1 },
  { name: "Black Galaxy Granite", category: "Sparkling Darks", description: "Deep black background speckled with radiant golden and copper flecks.", finish: "Polished", imageUrl: "/images/black-galaxy.jpg", isFeatured: 1 },
  { name: "Tan Brown Granite", category: "Earthy Browns", description: "Rich chocolate and tan tones with dark grey and black accents for warm interiors.", finish: "Leathered", imageUrl: "/images/tan-brown.jpg", isFeatured: 1 },
];

export const DEFAULT_GALLERY = [
  { title: "The Black House", location: "Bengaluru · Residence", year: "2024", imageUrl: "/images/project-black-house.jpg", sortOrder: 1 },
  { title: "Soft Geometry", location: "Chennai · Private home", year: "2023", imageUrl: "/images/project-soft-geometry.jpg", sortOrder: 2 },
  { title: "The Long Table", location: "Goa · Hospitality", year: "2024", imageUrl: "/images/project-long-table.jpg", sortOrder: 3 },
];

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
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
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  values.lastSignedIn ??= new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
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
  const rows = await db.select().from(collections).orderBy(desc(collections.isFeatured), asc(collections.id));
  return rows.length ? rows : DEFAULT_COLLECTIONS;
}

export async function getGallery() {
  const db = await getDb(); if (!db) return DEFAULT_GALLERY;
  const rows = await db.select().from(gallery).orderBy(asc(gallery.sortOrder), asc(gallery.id));
  return rows.length ? rows : DEFAULT_GALLERY;
}

export async function getEnquiries() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
}

export async function seedGraniteContent() {
  const db = await getDb(); if (!db) return;
  const current = await db.select().from(siteContent).limit(1);
  if (!current.length) await db.insert(siteContent).values(DEFAULT_CONTENT);
  const existingCollections = await db.select().from(collections).limit(1);
  if (!existingCollections.length) await db.insert(collections).values(DEFAULT_COLLECTIONS);
  const existingGallery = await db.select().from(gallery).limit(1);
  if (!existingGallery.length) await db.insert(gallery).values(DEFAULT_GALLERY);
}

export async function updateSiteContent(input: Partial<typeof DEFAULT_CONTENT>) {
  const db = await getDb(); if (!db) return DEFAULT_CONTENT;
  await seedGraniteContent();
  await db.update(siteContent).set(input).where(eq(siteContent.id, 1));
  return getSiteContent();
}

export async function updateCollection(id: number, input: Partial<typeof DEFAULT_COLLECTIONS[number]>) {
  const db = await getDb(); if (!db) return null;
  await db.update(collections).set(input).where(eq(collections.id, id));
  return db.select().from(collections).where(eq(collections.id, id)).limit(1);
}

export async function updateGalleryItem(id: number, input: Partial<typeof DEFAULT_GALLERY[number]>) {
  const db = await getDb(); if (!db) return null;
  await db.update(gallery).set(input).where(eq(gallery.id, id));
  return db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
}

export async function createEnquiry(input: typeof enquiries.$inferInsert) {
  const db = await getDb(); if (!db) return { ...input, id: Date.now(), createdAt: new Date() };
  const result = await db.insert(enquiries).values(input);
  return { id: Number(result[0].insertId), ...input };
}

export async function updateEnquiryStatus(id: number, status: string) {
  const db = await getDb(); if (!db) return null;
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));
  return true;
}
