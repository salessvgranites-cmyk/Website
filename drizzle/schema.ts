import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const siteContent = mysqlTable("siteContent", {
  id: int("id").autoincrement().primaryKey(),
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
  aboutImage: text("aboutImage").notNull(),
  logoImage: text("logoImage").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description").notNull(),
  finish: varchar("finish", { length: 80 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  isFeatured: int("isFeatured").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gallery = mysqlTable("gallery", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 140 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  year: varchar("year", { length: 20 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const enquiries = mysqlTable("enquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 60 }).notNull(),
  projectType: varchar("projectType", { length: 100 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 30 }).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SiteContent = typeof siteContent.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type GalleryItem = typeof gallery.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
