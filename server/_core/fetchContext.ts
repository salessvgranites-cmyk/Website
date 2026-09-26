import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { sdk } from "./sdk";
import type { User } from "../../drizzle/schema";

// Minimal req interface that both Express.Request and fetch Request satisfy
// via the reqLike shim — used so the router context is compatible with both adapters.
export type FetchTrpcContext = {
  // We cast req to any here intentionally. The router only uses ctx.req for
  // cookie parsing (via sdk.authenticateRequest), which we pre-resolve below.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  resHeaders: Headers;
  user: User | null;
  // Shim for ctx.res.clearCookie used in the logout mutation
  res: {
    clearCookie: (name: string, options?: Record<string, unknown>) => void;
  };
};

export async function createFetchContext(
  opts: FetchCreateContextFnOptions
): Promise<FetchTrpcContext> {
  let user: User | null = null;

  // Build a req-like object that sdk.authenticateRequest can consume
  const cookieHeader = opts.req.headers.get("cookie") ?? "";
  const authHeader = opts.req.headers.get("authorization") ?? undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reqLike: any = {
    headers: {
      cookie: cookieHeader,
      authorization: authHeader,
    },
  };

  try {
    user = await sdk.authenticateRequest(reqLike);
  } catch {
    user = null;
  }

  // Shim for the logout mutation which calls ctx.res.clearCookie(...)
  // In serverless we write the expired cookie into the response headers instead.
  const res = {
    clearCookie: (name: string) => {
      opts.resHeaders.append(
        "Set-Cookie",
        `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`
      );
    },
  };

  return {
    req: reqLike,   // pass the shim so getSessionCookieOptions in routers doesn't fail
    resHeaders: opts.resHeaders,
    user,
    res,
  };
}
