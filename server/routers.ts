import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCollection, createEnquiry, createFinish, createGalleryItem, createProduct,
  deleteCollection, deleteFinish, deleteGalleryItem, deleteProduct,
  getAllCollections, getAllFinishes, getAllGallery, getAllProducts,
  getCollections, getEnquiries, getFinishes, getGallery, getProducts, getSectionVisibility, getSiteContent,
  reorderCollections, reorderFinishes, reorderGallery, reorderProducts,
  seedGraniteContent,
  toggleCollectionVisibility, toggleFinishVisibility, toggleGalleryVisibility, toggleProductVisibility,
  updateCollection, updateEnquiryStatus, updateFinish, updateGalleryItem, updateProduct,
  updateSectionVisibility, updateSiteContent,
} from "./db";

const contentInput = z.object({
  brandName: z.string().nullish(),
  tagline: z.string().nullish(),
  heroEyebrow: z.string().nullish(),
  heroTitle: z.string().nullish(),
  heroCopy: z.string().nullish(),
  aboutTitle: z.string().nullish(),
  aboutCopy: z.string().nullish(),
  phone: z.string().nullish(),
  whatsapp: z.string().nullish(),
  email: z.string().nullish(),
  address: z.string().nullish(),
  hours: z.string().nullish(),
  heroImage: z.string().nullish(),
  heroImage2: z.string().nullish(),
  aboutImage: z.string().nullish(),
  logoImage: z.string().nullish(),
  heroSubtext: z.string().nullish(),
  facilityImage1: z.string().nullish(),
  facilityImage2: z.string().nullish(),
  facilityImage3: z.string().nullish(),
  facilityImage4: z.string().nullish(),
  facilityImage5: z.string().nullish(),
  facilityTitle: z.string().nullish(),
  facilityCopy: z.string().nullish(),
  bannerImage: z.string().nullish(),
  mapsUrl: z.string().nullish(),
});

const collectionInput = z.object({
  name: z.string().min(1),
  category: z.string().nullish(),
  description: z.string().nullish(),
  finish: z.string().nullish(),
  imageUrl: z.string().nullish(),
  isFeatured: z.number().int().min(0).max(1).nullish(),
  sortOrder: z.number().int().nullish(),
  isVisible: z.number().int().min(0).max(1).nullish(),
});

const galleryInput = z.object({
  title: z.string().nullish(),
  location: z.string().nullish(),
  year: z.string().nullish(),
  imageUrl: z.string().min(1),
  sortOrder: z.number().int().nullish(),
  isVisible: z.number().int().min(0).max(1).nullish(),
});

const productInput = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  sortOrder: z.number().int().nullish(),
  isVisible: z.number().int().min(0).max(1).nullish(),
});

const finishInput = z.object({
  name: z.string().min(1),
  tagline: z.string().nullish(),
  description: z.string().nullish(),
  badge: z.string().nullish(),
  imageUrl: z.string().nullish(),
  sortOrder: z.number().int().nullish(),
  isVisible: z.number().int().min(0).max(1).nullish(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  site: router({
    content: publicProcedure.query(async () => { await seedGraniteContent(); return getSiteContent(); }),
    collections: publicProcedure.query(getCollections),
    gallery: publicProcedure.query(getGallery),
    products: publicProcedure.query(getProducts),
    finishes: publicProcedure.query(getFinishes),
    sectionVisibility: publicProcedure.query(getSectionVisibility),
    enquiry: publicProcedure.input(z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(5), projectType: z.string().min(2), message: z.string().min(5) })).mutation(({ input }) => createEnquiry({ ...input, status: "new" })),
  }),
  admin: router({
    content: adminProcedure.query(async () => { await seedGraniteContent(); return getSiteContent(); }),
    saveContent: adminProcedure.input(contentInput).mutation(({ input }) => updateSiteContent(input)),

    // Collections
    collections: adminProcedure.query(async () => { await seedGraniteContent(); return getAllCollections(); }),
    saveCollection: adminProcedure.input(z.object({ id: z.number().int(), data: collectionInput })).mutation(({ input }) => updateCollection(input.id, input.data)),
    createCollection: adminProcedure.input(collectionInput).mutation(({ input }) => createCollection({ name: input.name, category: input.category, description: input.description, finish: input.finish, imageUrl: input.imageUrl, isFeatured: input.isFeatured ?? 1 })),
    deleteCollection: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteCollection(input.id)),
    toggleCollectionVisibility: adminProcedure.input(z.object({ id: z.number().int(), isVisible: z.number().int().min(0).max(1) })).mutation(({ input }) => toggleCollectionVisibility(input.id, input.isVisible)),
    reorderCollections: adminProcedure.input(z.array(z.number().int())).mutation(({ input }) => reorderCollections(input)),

    // Gallery
    gallery: adminProcedure.query(async () => { await seedGraniteContent(); return getAllGallery(); }),
    saveGallery: adminProcedure.input(z.object({ id: z.number().int(), data: galleryInput })).mutation(({ input }) => updateGalleryItem(input.id, input.data)),
    createGallery: adminProcedure.input(galleryInput).mutation(({ input }) => createGalleryItem({ ...input, sortOrder: input.sortOrder ?? 0 })),
    deleteGallery: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteGalleryItem(input.id)),
    toggleGalleryVisibility: adminProcedure.input(z.object({ id: z.number().int(), isVisible: z.number().int().min(0).max(1) })).mutation(({ input }) => toggleGalleryVisibility(input.id, input.isVisible)),
    reorderGallery: adminProcedure.input(z.array(z.number().int())).mutation(({ input }) => reorderGallery(input)),

    // Products
    products: adminProcedure.query(async () => { await seedGraniteContent(); return getAllProducts(); }),
    saveProduct: adminProcedure.input(z.object({ id: z.number().int(), data: productInput })).mutation(({ input }) => updateProduct(input.id, input.data)),
    createProduct: adminProcedure.input(productInput).mutation(({ input }) => createProduct({ name: input.name, description: input.description, imageUrl: input.imageUrl, sortOrder: input.sortOrder ?? 0 })),
    deleteProduct: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteProduct(input.id)),
    toggleProductVisibility: adminProcedure.input(z.object({ id: z.number().int(), isVisible: z.number().int().min(0).max(1) })).mutation(({ input }) => toggleProductVisibility(input.id, input.isVisible)),
    reorderProducts: adminProcedure.input(z.array(z.number().int())).mutation(({ input }) => reorderProducts(input)),

    // Finishes
    finishes: adminProcedure.query(async () => { await seedGraniteContent(); return getAllFinishes(); }),
    saveFinish: adminProcedure.input(z.object({ id: z.number().int(), data: finishInput })).mutation(({ input }) => updateFinish(input.id, input.data)),
    createFinish: adminProcedure.input(finishInput).mutation(({ input }) => createFinish({ name: input.name, tagline: input.tagline, description: input.description, badge: input.badge, imageUrl: input.imageUrl, sortOrder: input.sortOrder ?? 0 })),
    deleteFinish: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteFinish(input.id)),
    toggleFinishVisibility: adminProcedure.input(z.object({ id: z.number().int(), isVisible: z.number().int().min(0).max(1) })).mutation(({ input }) => toggleFinishVisibility(input.id, input.isVisible)),
    reorderFinishes: adminProcedure.input(z.array(z.number().int())).mutation(({ input }) => reorderFinishes(input)),

    // Section Visibility
    sectionVisibility: adminProcedure.query(async () => { await seedGraniteContent(); return getSectionVisibility(); }),
    updateSectionVisibility: adminProcedure.input(z.object({ sectionKey: z.string(), isVisible: z.number().int().min(0).max(1) })).mutation(({ input }) => updateSectionVisibility(input.sectionKey, input.isVisible)),

    // Enquiries
    enquiries: adminProcedure.query(getEnquiries),
    updateEnquiry: adminProcedure.input(z.object({ id: z.number().int(), status: z.string() })).mutation(({ input }) => updateEnquiryStatus(input.id, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
