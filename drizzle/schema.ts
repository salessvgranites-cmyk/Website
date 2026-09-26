import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const siteContent = pgTable("siteContent", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  brandName: varchar("brandName", { length: 140 }).notNull(),
  tagline: varchar("tagline", { length: 240 }).notNull(),
  heroEyebrow: varchar("heroEyebrow", { length: 160 }).notNull(),
  heroTitle: varchar("heroTitle", { length: 240 }).notNull(),
  heroCopy: text("heroCopy").notNull(),
  aboutTitle: varchar("aboutTitle", { length: 180 }).notNull(),
  aboutCopy: text("aboutCopy").notNull(),
  phone: varchar("phone", { length: 60 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 60 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const collections = pgTable("collections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description").notNull(),
  finish: varchar("finish", { length: 80 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  isFeatured: integer("isFeatured").default(1).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isVisible: integer("isVisible").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gallery = pgTable("gallery", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 140 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  year: varchar("year", { length: 20 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isVisible: integer("isVisible").default(1).notNull(),
});

export const enquiries = pgTable("enquiries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 60 }).notNull(),
  projectType: varchar("projectType", { length: 100 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 30 }).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("imageUrl").notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isVisible: integer("isVisible").default(1).notNull(),
});

export const finishes = pgTable("finishes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  tagline: varchar("tagline", { length: 240 }).notNull(),
  description: text("description").notNull(),
  badge: varchar("badge", { length: 80 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isVisible: integer("isVisible").default(1).notNull(),
});

export const sectionVisibility = pgTable("sectionVisibility", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sectionKey: varchar("sectionKey", { length: 60 }).notNull().unique(),
  isVisible: integer("isVisible").default(1).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SiteContent = typeof siteContent.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type GalleryItem = typeof gallery.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Finish = typeof finishes.$inferSelect;
export type SectionVisibility = typeof sectionVisibility.$inferSelect;
