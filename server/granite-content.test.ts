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
    expect(DEFAULT_CONTENT.brandName).toBeTruthy();
    expect(DEFAULT_CONTENT.phone).toBeTruthy();
    expect(DEFAULT_CONTENT.logoImage).toBeTruthy();
    expect(DEFAULT_CONTENT.heroImage).toBeTruthy();
  });

  it("ships with a usable collection and project seed", () => {
    expect(DEFAULT_COLLECTIONS.length).toBeGreaterThanOrEqual(1);
    for (const item of DEFAULT_COLLECTIONS) {
      expect(item.name).toBeTruthy();
      expect(item.imageUrl).toBeTruthy();
    }
    expect(DEFAULT_GALLERY.length).toBeGreaterThanOrEqual(1);
    for (const item of DEFAULT_GALLERY) {
      expect(item.imageUrl).toBeTruthy();
    }
  });
});

describe("admin content authorization", () => {
  it("rejects anonymous content access", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.admin.content()).rejects.toThrow(TRPCError);
    await expect(caller.admin.content()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
