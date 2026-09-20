import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createEnquiry, getCollections, getEnquiries, getGallery, getSiteContent, seedGraniteContent, updateCollection, updateEnquiryStatus, updateGalleryItem, updateSiteContent } from "./db";

const contentInput = z.object({
  brandName: z.string().min(2), tagline: z.string().min(2), heroEyebrow: z.string().min(2), heroTitle: z.string().min(2), heroCopy: z.string().min(2), aboutTitle: z.string().min(2), aboutCopy: z.string().min(2), phone: z.string().min(5), whatsapp: z.string().min(5), email: z.string().email(), address: z.string().min(5), hours: z.string().min(2), heroImage: z.string().min(2), aboutImage: z.string().min(2), logoImage: z.string().min(2),
});
const collectionInput = z.object({ name: z.string().min(2), category: z.string().min(2), description: z.string().min(2), finish: z.string().min(2), imageUrl: z.string().min(2), isFeatured: z.number().int().min(0).max(1) });
const galleryInput = z.object({ title: z.string().min(2), location: z.string().min(2), year: z.string().min(2), imageUrl: z.string().min(2), sortOrder: z.number().int() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  site: router({
    content: publicProcedure.query(async () => { await seedGraniteContent(); return getSiteContent(); }),
    collections: publicProcedure.query(getCollections),
    gallery: publicProcedure.query(getGallery),
    enquiry: publicProcedure.input(z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(5), projectType: z.string().min(2), message: z.string().min(5) })).mutation(({ input }) => createEnquiry({ ...input, status: "new" })),
  }),
  admin: router({
    content: adminProcedure.query(async () => { await seedGraniteContent(); return getSiteContent(); }),
    saveContent: adminProcedure.input(contentInput).mutation(({ input }) => updateSiteContent(input)),
    collections: adminProcedure.query(async () => { await seedGraniteContent(); return getCollections(); }),
    saveCollection: adminProcedure.input(z.object({ id: z.number().int(), data: collectionInput })).mutation(({ input }) => updateCollection(input.id, input.data)),
    gallery: adminProcedure.query(async () => { await seedGraniteContent(); return getGallery(); }),
    saveGallery: adminProcedure.input(z.object({ id: z.number().int(), data: galleryInput })).mutation(({ input }) => updateGalleryItem(input.id, input.data)),
    enquiries: adminProcedure.query(getEnquiries),
    updateEnquiry: adminProcedure.input(z.object({ id: z.number().int(), status: z.string() })).mutation(({ input }) => updateEnquiryStatus(input.id, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
