import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { DEFAULT_COLLECTIONS, DEFAULT_CONTENT, DEFAULT_GALLERY } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const anonymousContext: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: () => undefined } as TrpcContext["res"],
};

describe("granite content defaults", () => {
  it("includes the brand contact surface and visual assets", () => {
    expect(DEFAULT_CONTENT.brandName).toBe("Sri Venkateswara Granites");
    expect(DEFAULT_CONTENT.phone).toContain("+91");
    expect(DEFAULT_CONTENT.logoImage).toContain("/manus-storage/");
    expect(DEFAULT_CONTENT.heroImage).toContain("/manus-storage/");
  });

  it("ships with a usable collection and project seed", () => {
    expect(DEFAULT_COLLECTIONS).toHaveLength(4);
    expect(DEFAULT_COLLECTIONS.every((item) => item.name && item.imageUrl)).toBe(true);
    expect(DEFAULT_GALLERY).toHaveLength(3);
    expect(DEFAULT_GALLERY.every((item) => item.title && item.location)).toBe(true);
  });
});

describe("admin content authorization", () => {
  it("rejects anonymous content access", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.admin.content()).rejects.toMatchObject<TRPCError>({ code: "FORBIDDEN" });
  });
});
