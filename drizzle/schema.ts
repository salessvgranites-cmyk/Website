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
  finishesCopy: text("finishesCopy").default("From mirror-polished luxury to rugged flamed textures — each finish transforms stone into a distinct architectural statement."),
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
  globalReachCopy: text("globalReachCopy").default("Manufactured in South India · Prepared for international buyers."),
  galleryEyebrow: text("galleryEyebrow").default("GALLERY"),
  galleryTitle: text("galleryTitle").default("Stone in Every Frame."),
  enquiryTitle: text("enquiryTitle").default("LOOKING FOR THE RIGHT STONE?"),
  enquiryCopy: text("enquiryCopy").default("Tell us what you're looking for. We'll help you find the right material, finish and specification."),
  bannerTitle: text("bannerTitle").default("STONE THAT LASTS. PARTNERSHIPS THAT GROW."),
  bannerSubtitle: text("bannerSubtitle").default("South India · India"),
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
