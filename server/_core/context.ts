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

export type CreateContextOptions = {
  req: any;
  res: any;
  info?: any;
};

export async function createContext(
  opts: CreateContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Polyfill clearCookie if running in serverless Node runtime (ServerResponse)
  const res = opts.res;
  if (res && typeof res.clearCookie !== "function" && typeof res.setHeader === "function") {
    (res as any).clearCookie = (name: string, options: any = {}) => {
      const isSecure = options.secure ?? true;
      const sameSite = options.sameSite ?? "Lax";
      const path = options.path ?? "/";
      res.setHeader(
        "Set-Cookie",
        `${name}=; Path=${path}; HttpOnly; SameSite=${sameSite}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${isSecure ? "; Secure" : ""}`
      );
      return res;
    };
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
