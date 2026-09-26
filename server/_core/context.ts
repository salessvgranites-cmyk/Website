import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

// Using `any` for req/res so this context shape is compatible with both the
// Express adapter (local dev) and the fetch adapter (Vercel serverless).
// Individual route handlers that need Express-specific methods already cast
// internally (e.g. getSessionCookieOptions uses req.hostname etc.)
export type TrpcContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res: any;
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
